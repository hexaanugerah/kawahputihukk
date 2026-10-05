// Package bootstrap wires the entire application: config -> infra ->
// per-domain repository/service/usecase/handler -> routes. Per Part 2.2's
// Dependency Injection rule ("Never create dependency manually inside
// handlers") — this is the ONE place allowed to call every domain's
// constructor and connect them together. No domain package imports
// another domain package directly; every cross-domain link below is an
// adapter satisfying an interface owned by the consuming domain.
package bootstrap

import (
	"context"
	"time"

	"github.com/kpr-tourism/backend/internal/config"
	"github.com/kpr-tourism/backend/internal/domain/article"
	"github.com/kpr-tourism/backend/internal/domain/booking"
	"github.com/kpr-tourism/backend/internal/domain/gallery"
	tourismpackage "github.com/kpr-tourism/backend/internal/domain/package"
	"github.com/kpr-tourism/backend/internal/domain/role"
	"github.com/kpr-tourism/backend/internal/domain/user"

	"github.com/kpr-tourism/backend/internal/domain/auth"
	"github.com/kpr-tourism/backend/internal/payment/midtrans"
	"github.com/kpr-tourism/backend/internal/scheduler"
	"github.com/kpr-tourism/backend/pkg/jwtutil"
	"github.com/kpr-tourism/backend/pkg/mailer"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

// App bundles every wired handler + a couple of infra pieces cmd/server
// needs directly (JWTManager for middleware, the scheduler to launch).
type App struct {
	FrontendURL    string
	AuthHandler    *auth.Handler
	RoleHandler    *role.Handler
	UserHandler    *user.Handler
	ArticleHandler *article.Handler
	GalleryHandler *gallery.Handler
	PackageHandler *tourismpackage.Handler
	BookingHandler *booking.Handler

	JWTManager *jwtutil.Manager
	Sweeper    *scheduler.ExpiredBookingSweeper
}

// packageCatalogAdapter satisfies booking.PackagePricingProvider by
// wrapping the package domain's service — the anti-corruption layer that
// keeps booking from importing the tourismpackage package's types
// directly.
type packageCatalogAdapter struct {
	svc *tourismpackage.Service
}

func (a *packageCatalogAdapter) GetPricing(ctx context.Context, packageID string) (booking.PackagePricing, error) {
	p, err := a.svc.Get(ctx, packageID)
	if err != nil {
		return booking.PackagePricing{}, err
	}
	return booking.PackagePricing{Name: p.Name, UnitCents: p.PriceCents, Currency: p.Currency, MaxCapacity: p.MaxCapacity, IsActive: p.IsActive}, nil
}

// Build wires the entire application graph. Called once from
// cmd/server/main.go.
func Build(cfg *config.Config, db *gorm.DB, log *zap.Logger) *App {
	jwtManager := jwtutil.NewManager(cfg.JWT.AccessSecret, cfg.JWT.RefreshSecret, cfg.JWT.AccessTTL, cfg.JWT.RefreshTTL, cfg.JWT.Issuer)
	mailerClient := mailer.New(mailer.Config{Host: cfg.SMTP.Host, Port: cfg.SMTP.Port, User: cfg.SMTP.User, Password: cfg.SMTP.Password, From: cfg.SMTP.From}, log)

	// ---- role domain (built first — auth and user depend on it) ----
	roleRepo := role.NewRepository(db)
	roleService := role.NewService(roleRepo)
	roleUsecase := role.NewUsecase(roleService)
	roleHandler := role.NewHandler(roleUsecase)

	// ---- auth domain ----
	// role.Service satisfies auth.RoleProvider structurally: it has
	// AssignDefaultRole(ctx, userID) error and GetRoleNames(ctx, userID)
	// ([]string, error) with matching signatures — no adapter struct needed.
	authRepo := auth.NewRepository(db)
	authService := auth.NewService(authRepo, jwtManager, mailerClient, cfg.GoogleOAuth, cfg.App.FrontendURL, log)
	authUsecase := auth.NewUsecase(authService, roleService)
	authHandler := auth.NewHandler(authUsecase)

	// ---- user (staff management) domain ----
	userRepo := user.NewRepository(db)
	userService := user.NewService(userRepo)
	userUsecase := user.NewUsecase(userService, roleService) // roleService satisfies user.RoleLister
	userHandler := user.NewHandler(userUsecase)

	// ---- article domain ----
	articleRepo := article.NewRepository(db)
	articleService := article.NewService(articleRepo)
	articleUsecase := article.NewUsecase(articleService)
	articleHandler := article.NewHandler(articleUsecase)

	// ---- gallery domain ----
	galleryRepo := gallery.NewRepository(db)
	galleryService := gallery.NewService(galleryRepo)
	galleryUsecase := gallery.NewUsecase(galleryService)
	galleryHandler := gallery.NewHandler(galleryUsecase)

	// ---- package domain ----
	packageRepo := tourismpackage.NewRepository(db)
	packageService := tourismpackage.NewService(packageRepo)
	packageUsecase := tourismpackage.NewUsecase(packageService)
	packageHandler := tourismpackage.NewHandler(packageUsecase)

	// ---- booking domain ----
	paymentGateway := midtrans.NewGateway(midtrans.Config{ServerKey: cfg.Midtrans.ServerKey, ClientKey: cfg.Midtrans.ClientKey, IsProduction: cfg.Midtrans.IsProduction})
	bookingRepo := booking.NewRepository(db)
	bookingService := booking.NewService(bookingRepo, paymentGateway)
	bookingUsecase := booking.NewUsecase(bookingService, &packageCatalogAdapter{svc: packageService})
	bookingHandler := booking.NewHandler(bookingUsecase)

	// 30-minute payment window, checked every 5 minutes — hardcoded rather
	// than config-driven since this is an operational tuning knob, not a
	// per-environment secret; promote to config.go if a real deployment
	// needs a different value.
	sweeper := scheduler.NewExpiredBookingSweeper(bookingRepo, bookingService, 30*time.Minute, 5*time.Minute, log)

	return &App{
		FrontendURL: cfg.App.FrontendURL,
		AuthHandler: authHandler, RoleHandler: roleHandler, UserHandler: userHandler,
		ArticleHandler: articleHandler, GalleryHandler: galleryHandler, PackageHandler: packageHandler,
		BookingHandler: bookingHandler, JWTManager: jwtManager, Sweeper: sweeper,
	}
}
