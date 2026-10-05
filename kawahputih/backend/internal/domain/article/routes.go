package article

import (
	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/internal/middleware"
	"github.com/kpr-tourism/backend/pkg/jwtutil"
)

func RegisterRoutes(rg *gin.RouterGroup, h *Handler, jwtManager *jwtutil.Manager) {
	rg.GET("/articles", h.List)
	rg.GET("/articles/:id", h.Get)

	requireAuth := middleware.RequireAuth(jwtManager)
	content := rg.Group("", requireAuth, middleware.RequireRole("admin", "staff_content", "super_admin"))
	content.POST("/articles", h.Create)
	content.PUT("/articles/:id", h.Update)
	content.POST("/articles/:id/publish", h.Publish)
	content.POST("/articles/:id/archive", h.Archive)
	content.DELETE("/articles/:id", h.Delete)
}
