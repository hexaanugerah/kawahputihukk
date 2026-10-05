package gallery

import (
	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/internal/middleware"
	"github.com/kpr-tourism/backend/pkg/jwtutil"
)

func RegisterRoutes(rg *gin.RouterGroup, h *Handler, jwtManager *jwtutil.Manager) {
	rg.GET("/gallery", h.List)

	requireAuth := middleware.RequireAuth(jwtManager)
	content := rg.Group("", requireAuth, middleware.RequireRole("admin", "staff_content", "super_admin"))
	content.POST("/gallery", h.Create)
	content.DELETE("/gallery/:id", h.Delete)
}
