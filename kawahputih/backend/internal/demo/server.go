package demo

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"sort"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/internal/config"
	"github.com/kpr-tourism/backend/internal/middleware"
	"github.com/kpr-tourism/backend/pkg/jwtutil"
	"github.com/kpr-tourism/backend/pkg/response"
	"go.uber.org/zap"
)

const demoPassword = "kawahputih"

type user struct {
	ID         string   `json:"id"`
	Name       string   `json:"name"`
	Email      string   `json:"email"`
	Phone      string   `json:"phone"`
	IsVerified bool     `json:"is_verified"`
	IsActive   bool     `json:"is_active"`
	Roles      []string `json:"roles"`
	password   string
}

type tourismPackage struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Slug          string `json:"slug"`
	Description   string `json:"description"`
	CoverImage    string `json:"cover_image"`
	PriceCents    int64  `json:"price_cents"`
	Currency      string `json:"currency"`
	DurationHours int    `json:"duration_hours"`
	MaxCapacity   int    `json:"max_capacity"`
	IsActive      bool   `json:"is_active"`
}

type article struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Excerpt     string     `json:"excerpt"`
	Content     string     `json:"content"`
	CoverImage  string     `json:"cover_image"`
	Status      string     `json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	PublishedAt *time.Time `json:"published_at,omitempty"`
}

type galleryItem struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	ImageURL string `json:"image_url"`
	Category string `json:"category"`
}

type booking struct {
	ID            string  `json:"id"`
	UserID        string  `json:"user_id"`
	PackageID     string  `json:"package_id"`
	VisitDate     string  `json:"visit_date"`
	Quantity      int     `json:"quantity"`
	TotalCents    int64   `json:"total_cents"`
	Currency      string  `json:"currency"`
	Status        string  `json:"status"`
	TicketCode    string  `json:"ticket_code"`
	CheckedInAt   *string `json:"checked_in_at,omitempty"`
	CustomerName  string  `json:"customer_name"`
	CustomerEmail string  `json:"customer_email"`
	PaymentMethod string  `json:"payment_method,omitempty"`
}

type store struct {
	mu       sync.RWMutex
	jwt      *jwtutil.Manager
	users    map[string]*user
	byEmail  map[string]string
	packages map[string]tourismPackage
	articles map[string]article
	gallery  map[string]galleryItem
	bookings map[string]booking
	sequence int
}

func Run(cfg *config.Config, log *zap.Logger) {
	jwt := jwtutil.NewManager(cfg.JWT.AccessSecret, cfg.JWT.RefreshSecret, cfg.JWT.AccessTTL, cfg.JWT.RefreshTTL, cfg.JWT.Issuer)
	s := newStore(jwt)
	r := gin.New()
	r.Use(gin.Recovery(), middleware.CORS(cfg.App.FrontendURL))
	r.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok", "mode": "memory"}) })
	s.registerRoutes(r.Group("/api/v1"), cfg)

	srv := &http.Server{Addr: ":" + cfg.App.Port, Handler: r, ReadTimeout: 15 * time.Second, WriteTimeout: 15 * time.Second, IdleTimeout: 60 * time.Second}
	go func() {
		log.Info("memory demo API starting", zap.String("port", cfg.App.Port), zap.String("mode", "no database"))
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal("demo API failed to start", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Error("demo API shutdown failed", zap.Error(err))
	}
}

func newStore(jwt *jwtutil.Manager) *store {
	s := &store{
		jwt: jwt, users: make(map[string]*user), byEmail: make(map[string]string),
		packages: make(map[string]tourismPackage), articles: make(map[string]article),
		gallery: make(map[string]galleryItem), bookings: make(map[string]booking),
	}
	for _, u := range []user{
		{ID: "usr-admin", Name: "Administrator", Email: "admin@kawahputih.id", Phone: "081234567801", IsVerified: true, IsActive: true, Roles: []string{"admin", "super_admin"}, password: demoPassword},
		{ID: "usr-manager", Name: "Manager Kawah Putih", Email: "manager@kawahputih.id", Phone: "081234567802", IsVerified: true, IsActive: true, Roles: []string{"manager"}, password: demoPassword},
		{ID: "usr-petugas", Name: "Petugas Lapangan", Email: "petugas@kawahputih.id", Phone: "081234567803", IsVerified: true, IsActive: true, Roles: []string{"staff_ticketing"}, password: demoPassword},
		{ID: "usr-pengunjung", Name: "Siti Rahma", Email: "pengunjung@kawahputih.id", Phone: "081234567804", IsVerified: true, IsActive: true, Roles: []string{"visitor"}, password: demoPassword},
		{ID: "usr-content", Name: "Editor Konten", Email: "konten@kawahputih.id", Phone: "081234567805", IsVerified: true, IsActive: true, Roles: []string{"staff_content"}, password: demoPassword},
	} {
		s.users[u.ID] = &u
		s.byEmail[strings.ToLower(u.Email)] = u.ID
	}

	image := "http://localhost:3000/images/"
	for _, p := range []tourismPackage{
		{ID: "paket-reguler", Name: "Tiket Reguler", Slug: "tiket-reguler", Description: "Akses kawasan wisata Kawah Putih, shuttle pulang-pergi, dan area pandang utama.", CoverImage: image + "kawah-putih-hero.jpg", PriceCents: 8100000, Currency: "IDR", DurationHours: 4, MaxCapacity: 500, IsActive: true},
		{ID: "paket-terusan", Name: "Tiket Terusan", Slug: "tiket-terusan", Description: "Jelajahi Kawah Putih lebih leluasa dengan akses kawasan dan perjalanan pulang-pergi.", CoverImage: image + "kawah-lagoon.jpg", PriceCents: 12500000, Currency: "IDR", DurationHours: 6, MaxCapacity: 300, IsActive: true},
		{ID: "paket-ranger", Name: "Wisata Ranger", Slug: "wisata-ranger", Description: "Perjalanan alam bersama pemandu lokal untuk mengenal lanskap dan sejarah Kawah Putih.", CoverImage: image + "hutan-kawah.jpg", PriceCents: 18000000, Currency: "IDR", DurationHours: 3, MaxCapacity: 80, IsActive: true},
	} {
		s.packages[p.ID] = p
	}

	now := time.Now()
	for i, item := range []article{
		{ID: "artikel-1", Title: "Menjelajahi Kawah Putih", Slug: "menjelajahi-kawah-putih", Excerpt: "Panduan singkat untuk menikmati kawasan kawah dengan nyaman.", Content: "Nikmati udara pegunungan, pemandangan danau berwarna toska, dan jalur wisata yang tertata di Kawah Putih Rancabali.", CoverImage: image + "kawah-lagoon.jpg", Status: "published", CreatedAt: now.AddDate(0, 0, -3)},
		{ID: "artikel-2", Title: "Cerita Hutan Rancabali", Slug: "cerita-hutan-rancabali", Excerpt: "Mengenal ekosistem hutan yang menyelimuti dataran tinggi Rancabali.", Content: "Hutan di sekitar Kawah Putih menjadi rumah bagi beragam tumbuhan dataran tinggi.", CoverImage: image + "hutan-kawah.jpg", Status: "published", CreatedAt: now.AddDate(0, 0, -1)},
		{ID: "artikel-3", Title: "Persiapan Sebelum Berkunjung", Slug: "persiapan-berkunjung", Excerpt: "Informasi cuaca, pakaian, dan waktu terbaik untuk berkunjung.", Content: "Siapkan pakaian hangat dan rencanakan perjalanan pada pagi hari untuk mendapatkan pengalaman terbaik.", CoverImage: image + "kawah-putih-hero.jpg", Status: "draft", CreatedAt: now},
	} {
		if item.Status == "published" {
			published := item.CreatedAt
			item.PublishedAt = &published
		}
		s.articles[item.ID] = item
		_ = i
	}

	for i, item := range []galleryItem{
		{ID: "foto-1", Title: "Hutan berkabut", ImageURL: image + "hutan-kawah.jpg", Category: "Pemandangan"},
		{ID: "foto-2", Title: "Danau Kawah Putih", ImageURL: image + "kawah-lagoon.jpg", Category: "Pemandangan"},
		{ID: "foto-3", Title: "Jalur wisata", ImageURL: image + "jalur-kawah.jpg", Category: "Fasilitas"},
	} {
		s.gallery[item.ID] = item
		_ = i
	}

	date := now.Format("2006-01-02")
	seed := []booking{
		{ID: "booking-24001", UserID: "usr-pengunjung", PackageID: "paket-reguler", VisitDate: date, Quantity: 2, TotalCents: 16200000, Currency: "IDR", Status: "paid", TicketCode: "KP-24001", CustomerName: "Siti Rahma", CustomerEmail: "pengunjung@kawahputih.id", PaymentMethod: "QRIS"},
		{ID: "booking-24002", UserID: "usr-pengunjung", PackageID: "paket-terusan", VisitDate: date, Quantity: 1, TotalCents: 12500000, Currency: "IDR", Status: "checked_in", TicketCode: "KP-24002", CustomerName: "Siti Rahma", CustomerEmail: "pengunjung@kawahputih.id", PaymentMethod: "E-Wallet"},
		{ID: "booking-24003", UserID: "usr-pengunjung", PackageID: "paket-reguler", VisitDate: now.AddDate(0, 0, 2).Format("2006-01-02"), Quantity: 3, TotalCents: 24300000, Currency: "IDR", Status: "paid", TicketCode: "KP-24003", CustomerName: "Siti Rahma", CustomerEmail: "pengunjung@kawahputih.id", PaymentMethod: "Transfer Bank"},
		{ID: "booking-24004", UserID: "usr-pengunjung", PackageID: "paket-reguler", VisitDate: now.AddDate(0, 0, 4).Format("2006-01-02"), Quantity: 2, TotalCents: 16200000, Currency: "IDR", Status: "pending_payment", TicketCode: "KP-24004", CustomerName: "Siti Rahma", CustomerEmail: "pengunjung@kawahputih.id"},
	}
	for _, b := range seed {
		s.bookings[b.ID] = b
	}
	s.sequence = len(seed)
	return s
}

func (s *store) registerRoutes(r *gin.RouterGroup, cfg *config.Config) {
	r.POST("/auth/login", s.login)
	r.POST("/auth/register", s.register)
	r.POST("/auth/refresh", s.refresh)
	r.POST("/auth/logout", s.ok("Logout berhasil", nil))
	r.POST("/auth/password/forgot", s.ok("Jika akun tersedia, instruksi reset akan dikirim", nil))
	r.POST("/auth/password/reset", s.ok("Password diperbarui", nil))

	r.GET("/packages", s.listPackages)
	r.GET("/packages/:id", s.getPackage)
	packageAdmin := r.Group("/packages", s.authorize("admin", "super_admin"))
	packageAdmin.POST("", s.createPackage)
	packageAdmin.PUT("/:id", s.updatePackage)
	packageAdmin.DELETE("/:id", s.deletePackage)

	r.GET("/articles", s.listArticles)
	r.GET("/articles/:id", s.getArticle)
	content := r.Group("", s.authorize("admin", "super_admin", "staff_content"))
	content.POST("/articles", s.createArticle)
	content.PUT("/articles/:id", s.updateArticle)
	content.POST("/articles/:id/publish", s.publishArticle)
	content.POST("/articles/:id/archive", s.archiveArticle)
	content.DELETE("/articles/:id", s.deleteArticle)
	r.GET("/gallery", s.listGallery)
	content.POST("/gallery", s.createGallery)
	content.DELETE("/gallery/:id", s.deleteGallery)

	r.GET("/admin/users", s.authorize("admin", "super_admin"), s.listUsers)
	r.PATCH("/admin/users/:id/active", s.authorize("admin", "super_admin"), s.setUserActive)
	r.GET("/super-admin/roles", s.authorize("admin", "super_admin"), s.listRoles)
	r.PUT("/super-admin/users/:id/roles", s.authorize("admin", "super_admin"), s.setUserRoles)

	bookings := r.Group("/bookings", s.authorize("visitor", "admin", "super_admin", "manager", "staff_ticketing", "finance_admin"))
	bookings.POST("", s.createBooking)
	bookings.GET("/me", s.listMine)
	bookings.GET("/today", s.requireRoles("admin", "super_admin", "manager", "staff_ticketing"), s.listToday)
	bookings.GET("", s.requireRoles("admin", "super_admin", "manager", "finance_admin"), s.listAllBookings)
	bookings.POST("/checkin", s.requireRoles("admin", "super_admin", "manager", "staff_ticketing"), s.checkIn)
	bookings.GET("/:id", s.getBooking)
	bookings.POST("/:id/cancel", s.cancelBooking)
	bookings.POST("/:id/pay-demo", s.payDemo)

	r.GET("/analytics/overview", s.authorize("admin", "super_admin", "manager"), s.analytics)
	r.GET("/analytics/visitors", s.authorize("admin", "super_admin", "manager"), s.analytics)
}

func (s *store) authorize(allowed ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
		if auth == c.GetHeader("Authorization") || auth == "" {
			response.Unauthorized(c, "missing or malformed Authorization header")
			c.Abort()
			return
		}
		claims, err := s.jwt.ParseAccessToken(auth)
		if err != nil {
			response.Unauthorized(c, "invalid or expired access token")
			c.Abort()
			return
		}
		s.mu.RLock()
		_, exists := s.users[claims.UserID]
		s.mu.RUnlock()
		if !exists {
			response.Unauthorized(c, "account is no longer available")
			c.Abort()
			return
		}
		c.Set("demo_user_id", claims.UserID)
		c.Set("demo_roles", claims.Roles)
		if len(allowed) > 0 && !hasRoleAny(claims.Roles, allowed) {
			response.Forbidden(c, "you do not have permission to access this resource")
			c.Abort()
			return
		}
		c.Next()
	}
}

func (s *store) requireRoles(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		current, _ := c.Get("demo_roles")
		if !hasRoleAny(current.([]string), roles) {
			response.Forbidden(c, "you do not have permission to access this resource")
			c.Abort()
			return
		}
		c.Next()
	}
}

func hasRoleAny(userRoles []string, allowed []string) bool {
	for _, userRole := range userRoles {
		for _, candidate := range allowed {
			if userRole == candidate {
				return true
			}
		}
	}
	return false
}

func (s *store) login(c *gin.Context) {
	var payload struct{ Email, Password string }
	if !bind(c, &payload) {
		return
	}
	s.mu.RLock()
	id := s.byEmail[strings.ToLower(strings.TrimSpace(payload.Email))]
	u := s.users[id]
	if u == nil || !u.IsActive || u.password != payload.Password {
		s.mu.RUnlock()
		response.Unauthorized(c, "Email atau password tidak sesuai")
		return
	}
	copyUser := *u
	s.mu.RUnlock()
	s.issueSession(c, copyUser)
}

func (s *store) register(c *gin.Context) {
	var payload struct{ Name, Email, Phone, Password string }
	if !bind(c, &payload) {
		return
	}
	if strings.TrimSpace(payload.Name) == "" || strings.TrimSpace(payload.Email) == "" || len(payload.Password) < 8 {
		response.ValidationFailed(c, []response.FieldError{{Field: "name", Message: "Nama, email, dan password minimal 8 karakter wajib diisi"}})
		return
	}
	s.mu.Lock()
	email := strings.ToLower(strings.TrimSpace(payload.Email))
	if _, exists := s.byEmail[email]; exists {
		s.mu.Unlock()
		response.Conflict(c, "Email sudah terdaftar")
		return
	}
	id := s.nextID("usr")
	u := user{ID: id, Name: strings.TrimSpace(payload.Name), Email: email, Phone: payload.Phone, IsVerified: true, IsActive: true, Roles: []string{"visitor"}, password: payload.Password}
	s.users[id] = &u
	s.byEmail[email] = id
	s.mu.Unlock()
	s.issueSession(c, u)
}

func (s *store) issueSession(c *gin.Context, u user) {
	access, expiry, err := s.jwt.GenerateAccessToken(u.ID, u.Email, u.Roles)
	if err != nil {
		response.InternalError(c, "could not issue demo session")
		return
	}
	refresh, _, err := s.jwt.GenerateRefreshToken(u.ID, u.Email, u.Roles)
	if err != nil {
		response.InternalError(c, "could not issue demo session")
		return
	}
	response.OK(c, "Berhasil masuk", gin.H{
		"access_token": access, "refresh_token": refresh, "expires_at": expiry.Unix(),
		"user": gin.H{"id": u.ID, "name": u.Name, "email": u.Email, "phone": u.Phone, "is_verified": u.IsVerified},
	})
}

func (s *store) refresh(c *gin.Context) {
	var payload struct {
		RefreshToken string `json:"refresh_token"`
	}
	if !bind(c, &payload) {
		return
	}
	claims, err := s.jwt.ParseRefreshToken(payload.RefreshToken)
	if err != nil {
		response.Unauthorized(c, "invalid or expired refresh token")
		return
	}
	s.mu.RLock()
	u := s.users[claims.UserID]
	if u == nil {
		s.mu.RUnlock()
		response.Unauthorized(c, "account is no longer available")
		return
	}
	copyUser := *u
	s.mu.RUnlock()
	s.issueSession(c, copyUser)
}

func (s *store) listPackages(c *gin.Context) {
	s.mu.RLock()
	items := make([]tourismPackage, 0, len(s.packages))
	for _, item := range s.packages {
		if c.Query("active_only") != "true" || item.IsActive {
			items = append(items, item)
		}
	}
	s.mu.RUnlock()
	sort.Slice(items, func(i, j int) bool { return items[i].Name < items[j].Name })
	respondPage(c, items)
}

func (s *store) getPackage(c *gin.Context) {
	s.mu.RLock()
	item, ok := s.packages[c.Param("id")]
	s.mu.RUnlock()
	if !ok {
		response.NotFound(c, "Paket tidak ditemukan")
		return
	}
	response.OK(c, "Paket wisata", item)
}

func (s *store) createPackage(c *gin.Context) {
	var item tourismPackage
	if !bind(c, &item) {
		return
	}
	item.ID = s.nextID("paket")
	item.Slug = slug(item.Name)
	item.Currency = "IDR"
	item.IsActive = true
	if item.CoverImage == "" {
		item.CoverImage = "http://localhost:3000/images/kawah-putih-hero.jpg"
	}
	s.mu.Lock()
	s.packages[item.ID] = item
	s.mu.Unlock()
	response.Created(c, "Paket berhasil ditambahkan", item)
}

func (s *store) updatePackage(c *gin.Context) {
	var updates tourismPackage
	if !bind(c, &updates) {
		return
	}
	s.mu.Lock()
	item, ok := s.packages[c.Param("id")]
	if ok {
		item.Name, item.Description, item.CoverImage = updates.Name, updates.Description, updates.CoverImage
		item.PriceCents, item.DurationHours, item.MaxCapacity = updates.PriceCents, updates.DurationHours, updates.MaxCapacity
		item.IsActive, item.Slug = updates.IsActive, slug(updates.Name)
		s.packages[item.ID] = item
	}
	s.mu.Unlock()
	if !ok {
		response.NotFound(c, "Paket tidak ditemukan")
		return
	}
	response.OK(c, "Paket diperbarui", item)
}

func (s *store) deletePackage(c *gin.Context) {
	s.mu.Lock()
	_, ok := s.packages[c.Param("id")]
	delete(s.packages, c.Param("id"))
	s.mu.Unlock()
	if !ok {
		response.NotFound(c, "Paket tidak ditemukan")
		return
	}
	response.OK(c, "Paket dihapus", nil)
}

func (s *store) listArticles(c *gin.Context) {
	s.mu.RLock()
	items := make([]article, 0, len(s.articles))
	for _, item := range s.articles {
		if c.Query("status") == "" || item.Status == c.Query("status") || item.Status == "published" {
			items = append(items, item)
		}
	}
	s.mu.RUnlock()
	sort.Slice(items, func(i, j int) bool { return items[i].CreatedAt.After(items[j].CreatedAt) })
	respondPage(c, items)
}

func (s *store) getArticle(c *gin.Context) {
	s.mu.RLock()
	item, ok := s.articles[c.Param("id")]
	s.mu.RUnlock()
	if !ok {
		for _, candidate := range s.articles {
			if candidate.Slug == c.Param("id") && candidate.Status == "published" {
				item, ok = candidate, true
				break
			}
		}
	}
	if !ok || item.Status != "published" {
		response.NotFound(c, "Artikel tidak ditemukan")
		return
	}
	response.OK(c, "Artikel", item)
}

func (s *store) createArticle(c *gin.Context) {
	var item article
	if !bind(c, &item) {
		return
	}
	item.ID, item.Slug, item.Status, item.CreatedAt = s.nextID("artikel"), slug(item.Title), "draft", time.Now()
	s.mu.Lock()
	s.articles[item.ID] = item
	s.mu.Unlock()
	response.Created(c, "Artikel disimpan sebagai draft", item)
}

func (s *store) updateArticle(c *gin.Context) {
	var updates article
	if !bind(c, &updates) {
		return
	}
	s.mu.Lock()
	item, ok := s.articles[c.Param("id")]
	if ok {
		item.Title, item.Slug, item.Excerpt, item.Content = updates.Title, slug(updates.Title), updates.Excerpt, updates.Content
		item.CoverImage = updates.CoverImage
		s.articles[item.ID] = item
	}
	s.mu.Unlock()
	if !ok {
		response.NotFound(c, "Artikel tidak ditemukan")
		return
	}
	response.OK(c, "Artikel diperbarui", item)
}

func (s *store) publishArticle(c *gin.Context) { s.setArticleStatus(c, "published") }
func (s *store) archiveArticle(c *gin.Context) { s.setArticleStatus(c, "archived") }

func (s *store) setArticleStatus(c *gin.Context, status string) {
	s.mu.Lock()
	item, ok := s.articles[c.Param("id")]
	if ok {
		item.Status = status
		if status == "published" {
			now := time.Now()
			item.PublishedAt = &now
		}
		s.articles[item.ID] = item
	}
	s.mu.Unlock()
	if !ok {
		response.NotFound(c, "Artikel tidak ditemukan")
		return
	}
	response.OK(c, "Status artikel diperbarui", item)
}

func (s *store) deleteArticle(c *gin.Context) {
	s.mu.Lock()
	_, ok := s.articles[c.Param("id")]
	delete(s.articles, c.Param("id"))
	s.mu.Unlock()
	if !ok {
		response.NotFound(c, "Artikel tidak ditemukan")
		return
	}
	response.OK(c, "Artikel dihapus", nil)
}

func (s *store) listGallery(c *gin.Context) {
	s.mu.RLock()
	items := make([]galleryItem, 0, len(s.gallery))
	for _, item := range s.gallery {
		if c.Query("category") == "" || item.Category == c.Query("category") {
			items = append(items, item)
		}
	}
	s.mu.RUnlock()
	respondPage(c, items)
}

func (s *store) createGallery(c *gin.Context) {
	var item galleryItem
	if !bind(c, &item) {
		return
	}
	item.ID = s.nextID("foto")
	s.mu.Lock()
	s.gallery[item.ID] = item
	s.mu.Unlock()
	response.Created(c, "Foto ditambahkan", item)
}

func (s *store) deleteGallery(c *gin.Context) {
	s.mu.Lock()
	_, ok := s.gallery[c.Param("id")]
	delete(s.gallery, c.Param("id"))
	s.mu.Unlock()
	if !ok {
		response.NotFound(c, "Foto tidak ditemukan")
		return
	}
	response.OK(c, "Foto dihapus", nil)
}

func (s *store) listUsers(c *gin.Context) {
	search := strings.ToLower(c.Query("search"))
	s.mu.RLock()
	items := make([]user, 0, len(s.users))
	for _, item := range s.users {
		if search == "" || strings.Contains(strings.ToLower(item.Name+" "+item.Email), search) {
			items = append(items, *item)
		}
	}
	s.mu.RUnlock()
	sort.Slice(items, func(i, j int) bool { return items[i].Name < items[j].Name })
	respondPage(c, items)
}

func (s *store) setUserActive(c *gin.Context) {
	var payload struct {
		IsActive bool `json:"is_active"`
	}
	if !bind(c, &payload) {
		return
	}
	s.mu.Lock()
	u := s.users[c.Param("id")]
	if u != nil {
		u.IsActive = payload.IsActive
	}
	s.mu.Unlock()
	if u == nil {
		response.NotFound(c, "Pengguna tidak ditemukan")
		return
	}
	response.OK(c, "Status pengguna diperbarui", u)
}

func (s *store) listRoles(c *gin.Context) {
	response.OK(c, "Daftar peran", []gin.H{
		{"id": "role-admin", "name": "admin", "description": "Administrator"},
		{"id": "role-manager", "name": "manager", "description": "Manager operasional"},
		{"id": "role-ticketing", "name": "staff_ticketing", "description": "Petugas tiket"},
		{"id": "role-content", "name": "staff_content", "description": "Pengelola konten"},
		{"id": "role-visitor", "name": "visitor", "description": "Pengunjung"},
	})
}

func (s *store) setUserRoles(c *gin.Context) {
	var payload struct {
		Roles []string `json:"roles"`
	}
	if !bind(c, &payload) {
		return
	}
	s.mu.Lock()
	u := s.users[c.Param("id")]
	if u != nil && len(payload.Roles) > 0 {
		u.Roles = payload.Roles
	}
	s.mu.Unlock()
	if u == nil {
		response.NotFound(c, "Pengguna tidak ditemukan")
		return
	}
	response.OK(c, "Peran diperbarui", u)
}

func (s *store) createBooking(c *gin.Context) {
	var payload struct {
		PackageID     string `json:"package_id"`
		VisitDate     string `json:"visit_date"`
		Quantity      int    `json:"quantity"`
		CustomerName  string `json:"customer_name"`
		CustomerEmail string `json:"customer_email"`
	}
	if !bind(c, &payload) {
		return
	}
	visitDate, err := time.Parse("2006-01-02", payload.VisitDate)
	if err != nil || payload.Quantity < 1 || payload.Quantity > 50 {
		response.ValidationFailed(c, []response.FieldError{{Field: "visit_date", Message: "Tanggal atau jumlah tiket tidak valid"}})
		return
	}
	uid, _ := c.Get("demo_user_id")
	s.mu.Lock()
	p, ok := s.packages[payload.PackageID]
	if !ok || !p.IsActive {
		s.mu.Unlock()
		response.NotFound(c, "Paket tidak ditemukan")
		return
	}
	s.sequence++
	id := "booking-" + strconv.Itoa(24000+s.sequence)
	ticket := "KP-" + strconv.Itoa(24000+s.sequence)
	b := booking{ID: id, UserID: uid.(string), PackageID: p.ID, VisitDate: visitDate.Format("2006-01-02"), Quantity: payload.Quantity, TotalCents: p.PriceCents * int64(payload.Quantity), Currency: "IDR", Status: "pending_payment", TicketCode: ticket, CustomerName: payload.CustomerName, CustomerEmail: payload.CustomerEmail}
	s.bookings[id] = b
	s.mu.Unlock()
	response.Created(c, "Booking dibuat", gin.H{"booking_id": id, "redirect_url": "/payment?id=" + id, "status": b.Status})
}

func (s *store) listMine(c *gin.Context) {
	uid, _ := c.Get("demo_user_id")
	s.mu.RLock()
	items := make([]booking, 0)
	for _, item := range s.bookings {
		if item.UserID == uid.(string) {
			items = append(items, item)
		}
	}
	s.mu.RUnlock()
	sort.Slice(items, func(i, j int) bool { return items[i].VisitDate > items[j].VisitDate })
	respondPage(c, items)
}

func (s *store) getBooking(c *gin.Context) {
	s.mu.RLock()
	b, ok := s.bookings[c.Param("id")]
	roles, _ := c.Get("demo_roles")
	uid, _ := c.Get("demo_user_id")
	canView := ok && (b.UserID == uid.(string) || hasRoleAny(roles.([]string), []string{"admin", "super_admin", "manager", "staff_ticketing", "finance_admin"}))
	s.mu.RUnlock()
	if !canView {
		response.NotFound(c, "Booking tidak ditemukan")
		return
	}
	response.OK(c, "Detail booking", b)
}

func (s *store) cancelBooking(c *gin.Context) {
	uid, _ := c.Get("demo_user_id")
	s.mu.Lock()
	b, ok := s.bookings[c.Param("id")]
	if ok && b.UserID == uid.(string) && b.Status == "pending_payment" {
		b.Status = "cancelled"
		s.bookings[b.ID] = b
	} else {
		ok = false
	}
	s.mu.Unlock()
	if !ok {
		response.Conflict(c, "Booking tidak dapat dibatalkan")
		return
	}
	response.OK(c, "Booking dibatalkan", b)
}

func (s *store) payDemo(c *gin.Context) {
	var payload struct {
		Method string `json:"method"`
	}
	if !bind(c, &payload) {
		return
	}
	uid, _ := c.Get("demo_user_id")
	s.mu.Lock()
	b, ok := s.bookings[c.Param("id")]
	if ok && b.UserID == uid.(string) && b.Status == "pending_payment" {
		b.Status, b.PaymentMethod = "paid", payload.Method
		s.bookings[b.ID] = b
	} else {
		ok = false
	}
	s.mu.Unlock()
	if !ok {
		response.Conflict(c, "Booking tidak dapat dibayar")
		return
	}
	response.OK(c, "Pembayaran demo berhasil", b)
}

func (s *store) listToday(c *gin.Context) {
	date := c.Query("date")
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	s.mu.RLock()
	items := make([]booking, 0)
	for _, item := range s.bookings {
		if item.VisitDate == date {
			items = append(items, item)
		}
	}
	s.mu.RUnlock()
	sort.Slice(items, func(i, j int) bool { return items[i].TicketCode < items[j].TicketCode })
	respondPage(c, items)
}

func (s *store) listAllBookings(c *gin.Context) {
	s.mu.RLock()
	items := make([]booking, 0, len(s.bookings))
	for _, item := range s.bookings {
		if c.Query("status") == "" || item.Status == c.Query("status") {
			items = append(items, item)
		}
	}
	s.mu.RUnlock()
	sort.Slice(items, func(i, j int) bool { return items[i].VisitDate > items[j].VisitDate })
	respondPage(c, items)
}

func (s *store) checkIn(c *gin.Context) {
	var payload struct {
		TicketCode string `json:"ticket_code"`
	}
	if !bind(c, &payload) {
		return
	}
	s.mu.Lock()
	var found booking
	for id, item := range s.bookings {
		if strings.EqualFold(item.TicketCode, strings.TrimSpace(payload.TicketCode)) && item.Status == "paid" {
			now := time.Now().Format(time.RFC3339)
			item.Status, item.CheckedInAt = "checked_in", &now
			s.bookings[id] = item
			found = item
			break
		}
	}
	s.mu.Unlock()
	if found.ID == "" {
		response.Conflict(c, "Kode tiket tidak valid atau sudah digunakan")
		return
	}
	response.OK(c, "Check-in berhasil", found)
}

func (s *store) analytics(c *gin.Context) {
	s.mu.RLock()
	bookings := make([]booking, 0, len(s.bookings))
	for _, item := range s.bookings {
		bookings = append(bookings, item)
	}
	s.mu.RUnlock()
	today := time.Now().Format("2006-01-02")
	var visitors, tickets, revenue, paid, todayBookings, checkedIn int64
	for _, item := range bookings {
		if item.Status == "paid" || item.Status == "checked_in" {
			tickets += int64(item.Quantity)
			revenue += item.TotalCents
			paid++
		}
		if item.VisitDate == today {
			visitors += int64(item.Quantity)
			todayBookings++
		}
		if item.Status == "checked_in" {
			checkedIn += int64(item.Quantity)
		}
	}
	week := make([]gin.H, 0, 7)
	for day := 6; day >= 0; day-- {
		date := time.Now().AddDate(0, 0, -day)
		week = append(week, gin.H{"date": date.Format("2006-01-02"), "label": date.Format("Mon"), "visitors": 48 + (6-day)*17, "tickets": 30 + (6-day)*12, "revenue_cents": int64(24500000 + (6-day)*5300000)})
	}
	activities := []gin.H{
		{"time": "08:32", "activity": "Booking baru", "description": "Pembayaran QRIS berhasil", "status": "Berhasil"},
		{"time": "08:18", "activity": "Tiket divalidasi", "description": "KP-24002 · Siti Rahma", "status": "Valid"},
		{"time": "08:12", "activity": "Booking baru", "description": "Tiket reguler · 2 pengunjung", "status": "Berhasil"},
	}
	response.OK(c, "Ringkasan operasional", gin.H{
		"total_visitors": 7932, "tickets_sold": tickets + 9964, "total_bookings": len(bookings) + 1244,
		"total_revenue_cents": revenue + 12340000000, "bookings_today": todayBookings + 182,
		"visitors_today": visitors + 738, "checked_in_today": checkedIn + 6241,
		"unused_today": max(0, visitors+738-checkedIn-6241), "problem_tickets": 24,
		"weekly": week, "activities": activities,
		"top_packages": []gin.H{{"name": "Tiket Reguler", "tickets": 78}, {"name": "Tiket Terusan", "tickets": 60}, {"name": "Wisata Ranger", "tickets": 43}, {"name": "Paket Keluarga", "tickets": 30}},
		"staff":        []gin.H{{"name": "Ayu Rahma", "scans": 420, "last_active": "08:32", "status": "Aktif"}, {"name": "Rizky Adnan", "scans": 386, "last_active": "08:30", "status": "Aktif"}, {"name": "Dina Putri", "scans": 305, "last_active": "08:14", "status": "Aktif"}, {"name": "Budi Santoso", "scans": 98, "last_active": "Kemarin", "status": "Offline"}},
		"period":       "7 hari terakhir",
	})
}

func (s *store) nextID(prefix string) string {
	bytes := make([]byte, 4)
	if _, err := rand.Read(bytes); err != nil {
		return prefix + "-" + strconv.FormatInt(time.Now().UnixNano(), 36)
	}
	return prefix + "-" + hex.EncodeToString(bytes)
}

func bind(c *gin.Context, dst any) bool {
	if err := c.ShouldBindJSON(dst); err != nil {
		response.BadRequest(c, "Request body tidak valid", nil)
		return false
	}
	return true
}

func respondPage[T any](c *gin.Context, items []T) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	total := len(items)
	start := min((page-1)*limit, total)
	end := min(start+limit, total)
	response.OKWithMeta(c, "Data berhasil dimuat", items[start:end], response.BuildMeta(page, limit, int64(total)))
}

func (s *store) ok(message string, data any) gin.HandlerFunc {
	return func(c *gin.Context) { response.OK(c, message, data) }
}

func slug(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = strings.Join(strings.Fields(value), "-")
	return strings.ReplaceAll(value, " ", "-")
}
