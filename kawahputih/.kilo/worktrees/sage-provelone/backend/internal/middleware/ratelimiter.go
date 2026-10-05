package middleware

import (
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/pkg/jwtutil"
	"github.com/kpr-tourism/backend/pkg/response"
	"golang.org/x/time/rate"
)

type ipLimiterStore struct {
	mu       sync.Mutex
	limiters map[string]*limiterEntry
	rps      rate.Limit
	burst    int
}

type limiterEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

func newIPLimiterStore(rps rate.Limit, burst int) *ipLimiterStore {
	s := &ipLimiterStore{limiters: make(map[string]*limiterEntry), rps: rps, burst: burst}
	go s.evictLoop()
	return s
}

func (s *ipLimiterStore) get(ip string) *rate.Limiter {
	s.mu.Lock()
	defer s.mu.Unlock()
	entry, ok := s.limiters[ip]
	if !ok {
		entry = &limiterEntry{limiter: rate.NewLimiter(s.rps, s.burst)}
		s.limiters[ip] = entry
	}
	entry.lastSeen = time.Now()
	return entry.limiter
}

func (s *ipLimiterStore) evictLoop() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		s.mu.Lock()
		for ip, entry := range s.limiters {
			if time.Since(entry.lastSeen) > 15*time.Minute {
				delete(s.limiters, ip)
			}
		}
		s.mu.Unlock()
	}
}

func RateLimit(rps float64, burst int) gin.HandlerFunc {
	store := newIPLimiterStore(rate.Limit(rps), burst)
	return func(c *gin.Context) {
		if !store.get(c.ClientIP()).Allow() {
			response.TooManyRequests(c, "")
			c.Abort()
			return
		}
		c.Next()
	}
}

// TieredRateLimit implements Part 2.6's global throughput tiers — Guest 60
// req/min (keyed by IP, since guests have no identity), User 120 req/min,
// Admin 300 req/min (both keyed by user ID once authenticated, so one
// user's traffic on multiple IPs shares one bucket). This is separate from
// the stricter per-endpoint RateLimit(...) calls already on
// /auth/register, /auth/login, etc — those exist to blunt credential
// stuffing on one specific sensitive endpoint, while this middleware
// governs general API throughput across every request. Both apply
// simultaneously where they overlap; that's intentional layering, not
// redundancy.
func TieredRateLimit(jwtManager *jwtutil.Manager) gin.HandlerFunc {
	guestStore := newIPLimiterStore(rate.Limit(60.0/60.0), 10)
	userStore := newIPLimiterStore(rate.Limit(120.0/60.0), 20)
	adminStore := newIPLimiterStore(rate.Limit(300.0/60.0), 40)

	return func(c *gin.Context) {
		var limiter *rate.Limiter

		header := c.GetHeader("Authorization")
		if strings.HasPrefix(header, "Bearer ") {
			if claims, err := jwtManager.ParseAccessToken(strings.TrimPrefix(header, "Bearer ")); err == nil {
				if isAdminRole(claims.Roles) {
					limiter = adminStore.get(claims.UserID)
				} else {
					limiter = userStore.get(claims.UserID)
				}
			}
			// An invalid/expired token here is NOT rejected by this
			// middleware — that's RequireAuth's job downstream. This
			// middleware only tries to classify the caller's tier; on
			// failure it falls through to the guest tier below.
		}
		if limiter == nil {
			limiter = guestStore.get(c.ClientIP())
		}

		if !limiter.Allow() {
			response.TooManyRequests(c, "rate limit exceeded, please slow down")
			c.Abort()
			return
		}
		c.Next()
	}
}

func isAdminRole(roles []string) bool {
	for _, r := range roles {
		if r == "admin" || r == "super_admin" {
			return true
		}
	}
	return false
}
