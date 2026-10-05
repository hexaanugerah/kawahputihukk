package user

import (
	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/internal/middleware"
	"github.com/kpr-tourism/backend/pkg/jwtutil"
)

func RegisterRoutes(rg *gin.RouterGroup, h *Handler, jwtManager *jwtutil.Manager) {
	requireAuth := middleware.RequireAuth(jwtManager)
	admin := rg.Group("/admin", requireAuth, middleware.RequireRole("admin", "super_admin"))
	admin.GET("/users", h.List)
	admin.PATCH("/users/:id/active", h.SetActive)
}
