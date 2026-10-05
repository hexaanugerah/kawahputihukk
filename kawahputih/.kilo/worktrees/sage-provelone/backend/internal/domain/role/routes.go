package role

import (
	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/internal/middleware"
	"github.com/kpr-tourism/backend/pkg/jwtutil"
)

// RegisterRoutes mounts role management under /super-admin — only
// super_admin manages role assignment, per the separation-of-duties
// decision from Part 1.3's stakeholder analysis (admin != super_admin).
func RegisterRoutes(rg *gin.RouterGroup, h *Handler, jwtManager *jwtutil.Manager) {
	requireAuth := middleware.RequireAuth(jwtManager)

	superAdmin := rg.Group("/super-admin", requireAuth, middleware.RequireRole("super_admin"))
	superAdmin.GET("/roles", h.List)
	superAdmin.PUT("/users/:userId/roles", h.AssignToUser)

	owner := rg.Group("/owner", requireAuth, middleware.RequireRole("owner", "super_admin"))
	owner.GET("/roles", h.List) // read-only for Owner
}
