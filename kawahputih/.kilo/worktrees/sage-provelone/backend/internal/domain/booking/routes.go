package booking

import (
	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/internal/middleware"
	"github.com/kpr-tourism/backend/pkg/jwtutil"
)

func RegisterRoutes(rg *gin.RouterGroup, h *Handler, jwtManager *jwtutil.Manager) {
	requireAuth := middleware.RequireAuth(jwtManager)

	// Visitor: create/cancel/view own bookings — Guest cannot book (BRD).
	bookings := rg.Group("/bookings", requireAuth)
	bookings.POST("", h.Create)
	bookings.GET("/me", h.ListMine)
	bookings.GET("/:id", h.Get)
	bookings.POST("/:id/cancel", h.Cancel)

	// Public webhook — protected by signature verification inside the
	// service, never by RequireAuth (Midtrans cannot present a JWT). Path
	// follows Part 2.6's webhook convention (/webhooks/<provider>), a
	// rename from the earlier /payments/midtrans/notification.
	rg.POST("/webhooks/midtrans", h.PaymentWebhook)

	// Ticket Officer: scan/check-in + today's expected visitors.
	ticketing := rg.Group("", requireAuth, middleware.RequireRole("admin", "staff_ticketing", "super_admin"))
	ticketing.POST("/bookings/checkin", h.CheckIn)
	ticketing.GET("/bookings/today", h.ListToday)

	// Finance Admin: payment reconciliation oversight.
	finance := rg.Group("", requireAuth, middleware.RequireRole("admin", "finance_admin", "super_admin"))
	finance.GET("/bookings", h.ListAll)
}
