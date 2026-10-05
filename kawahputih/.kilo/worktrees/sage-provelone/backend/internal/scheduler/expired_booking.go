// Package scheduler runs periodic background jobs. Per Part 2.2's
// scheduler/ spec (daily_report.go, cleanup.go, backup.go,
// expired_booking.go, weather_sync.go) — expired_booking is implemented now
// since booking.Service.Expire already exists and needs a caller; the rest
// are still placeholders (see cmd/scheduler/main.go) since their domains
// (report, weather) haven't been built yet.
package scheduler

import (
	"context"
	"time"

	"github.com/kpr-tourism/backend/internal/domain/booking"
	"go.uber.org/zap"
)

// ExpiredBookingSweeper periodically expires bookings still
// pending_payment past a configured window. Midtrans Snap sessions
// naturally expire too, but this sweeper is what actually flips the local
// booking.Status so the package's capacity count frees up again —
// otherwise an abandoned booking would hold a capacity slot forever.
type ExpiredBookingSweeper struct {
	repo     booking.Repository
	service  *booking.Service
	window   time.Duration
	interval time.Duration
	log      *zap.Logger
}

func NewExpiredBookingSweeper(repo booking.Repository, service *booking.Service, window, interval time.Duration, log *zap.Logger) *ExpiredBookingSweeper {
	return &ExpiredBookingSweeper{repo: repo, service: service, window: window, interval: interval, log: log}
}

// Run blocks and ticks forever — call it in its own goroutine from
// cmd/scheduler/main.go (or inline in cmd/server for a single-binary
// deployment, which docker-compose uses for simplicity at this project's
// scale).
func (s *ExpiredBookingSweeper) Run(ctx context.Context) {
	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			s.sweepOnce(ctx)
		}
	}
}

func (s *ExpiredBookingSweeper) sweepOnce(ctx context.Context) {
	cutoff := time.Now().Add(-s.window)
	// Reuses ListAll(status=pending_payment) rather than a dedicated query —
	// acceptable at this project's scale; a dedicated "FindStalePending"
	// query is worth adding once booking volume makes a full-status scan
	// slow.
	bookings, _, err := s.repo.ListAll(ctx, booking.StatusPendingPayment, 0, 500)
	if err != nil {
		s.log.Error("expired booking sweep: list failed", zap.Error(err))
		return
	}
	for _, b := range bookings {
		if b.CreatedAt.After(cutoff) {
			continue
		}
		if err := s.service.Expire(ctx, b.ID); err != nil {
			s.log.Error("expired booking sweep: expire failed", zap.String("booking_id", b.ID), zap.Error(err))
		}
	}
}
