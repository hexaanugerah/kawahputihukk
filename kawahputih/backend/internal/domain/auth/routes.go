package auth

import (
	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/internal/middleware"
)

// RegisterRoutes mounts this domain's routes onto the given group. Every
// domain exposes exactly this function signature — internal/routes/routes.go
// calls all 7 of them to assemble the full API, so adding a new domain
// never means touching another domain's file.
func RegisterRoutes(rg *gin.RouterGroup, h *Handler) {
	g := rg.Group("/auth")
	g.POST("/register", middleware.RateLimit(1, 5), h.Register)
	g.POST("/login", middleware.RateLimit(1, 5), h.Login)
	g.POST("/refresh", middleware.RateLimit(2, 10), h.Refresh)
	g.POST("/logout", h.Logout)

	g.POST("/email/verify/request", middleware.RateLimit(1, 3), h.RequestEmailVerification)
	g.POST("/email/verify", h.VerifyEmail)

	g.POST("/password/forgot", middleware.RateLimit(1, 3), h.ForgotPassword)
	g.POST("/password/reset", h.ResetPassword)

	g.GET("/google/login", h.GoogleLogin)
	g.GET("/google/callback", h.GoogleCallback)
}
