package tourismpackage

import (
	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/internal/middleware"
	"github.com/kpr-tourism/backend/pkg/jwtutil"
)

func RegisterRoutes(rg *gin.RouterGroup, h *Handler, jwtManager *jwtutil.Manager) {
	rg.GET("/packages", h.List)
	rg.GET("/packages/:id", h.Get)

	requireAuth := middleware.RequireAuth(jwtManager)
	admin := rg.Group("/packages", requireAuth, middleware.RequireRole("admin", "super_admin"))
	admin.POST("", h.Create)
	admin.PUT("/:id", h.Update)
	admin.DELETE("/:id", h.Delete)
}
