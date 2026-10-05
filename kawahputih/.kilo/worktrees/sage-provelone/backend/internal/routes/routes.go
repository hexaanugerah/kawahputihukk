// Package routes assembles the full API by calling every domain's own
// RegisterRoutes function. This file is intentionally the only place that
// imports all 7 domain packages at once — domains never import each other,
// but something has to know they all exist, and that's here, not
// scattered across main.go or buried inside a domain.
package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/internal/bootstrap"
	"github.com/kpr-tourism/backend/internal/domain/article"
	"github.com/kpr-tourism/backend/internal/domain/auth"
	"github.com/kpr-tourism/backend/internal/domain/booking"
	"github.com/kpr-tourism/backend/internal/domain/gallery"
	tourismpackage "github.com/kpr-tourism/backend/internal/domain/package"
	"github.com/kpr-tourism/backend/internal/domain/role"
	"github.com/kpr-tourism/backend/internal/domain/user"
	"github.com/kpr-tourism/backend/internal/middleware"
	"go.uber.org/zap"
)

func NewRouter(app *bootstrap.App, log *zap.Logger) *gin.Engine {
	r := gin.New()
	r.Use(middleware.CORS(app.FrontendURL))
	r.Use(middleware.Recovery(log))
	r.Use(middleware.RequestLogger(log))
	r.Use(middleware.RequestID())
	// Global per-role throughput tier (Part 2.6) — applied before any route
	// group so it covers every endpoint, including public ones. Endpoint-
	// specific stricter limits (e.g. /auth/login) still apply on top via
	// their own middleware.RateLimit(...) calls inside each domain's
	// routes.go.
	r.Use(middleware.TieredRateLimit(app.JWTManager))

	r.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })

	v1 := r.Group("/api/v1")

	auth.RegisterRoutes(v1, app.AuthHandler)
	role.RegisterRoutes(v1, app.RoleHandler, app.JWTManager)
	user.RegisterRoutes(v1, app.UserHandler, app.JWTManager)
	article.RegisterRoutes(v1, app.ArticleHandler, app.JWTManager)
	gallery.RegisterRoutes(v1, app.GalleryHandler, app.JWTManager)
	tourismpackage.RegisterRoutes(v1, app.PackageHandler, app.JWTManager)
	booking.RegisterRoutes(v1, app.BookingHandler, app.JWTManager)

	return r
}
