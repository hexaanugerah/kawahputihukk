package booking

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/internal/middleware"
	"github.com/kpr-tourism/backend/pkg/apperror"
	"github.com/kpr-tourism/backend/pkg/response"
)

type Handler struct {
	usecase *Usecase
}

func NewHandler(usecase *Usecase) *Handler {
	return &Handler{usecase: usecase}
}

func (h *Handler) Create(c *gin.Context) {
	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request body", nil)
		return
	}
	if errs := Validate(req); errs != nil {
		response.ValidationFailed(c, errs)
		return
	}
	result, err := h.usecase.CreateBooking(c.Request.Context(), middleware.CurrentUserID(c), req)
	if err != nil {
		apperror.WriteHTTP(c, err)
		return
	}
	response.Created(c, "booking created, proceed to payment", result)
}

func (h *Handler) Cancel(c *gin.Context) {
	err := h.usecase.Cancel(c.Request.Context(), c.Param("id"), middleware.CurrentUserID(c), c.Query("reason"))
	if err != nil {
		apperror.WriteHTTP(c, err)
		return
	}
	response.OK(c, "booking cancelled", nil)
}

func (h *Handler) Get(c *gin.Context) {
	result, err := h.usecase.Get(c.Request.Context(), c.Param("id"))
	if err != nil {
		apperror.WriteHTTP(c, err)
		return
	}
	response.OK(c, "booking retrieved", result)
}

func (h *Handler) ListMine(c *gin.Context) {
	page, _ := strconv.Atoi(c.Query("page"))
	perPage, _ := strconv.Atoi(c.Query("limit"))
	result, total, err := h.usecase.ListMine(c.Request.Context(), middleware.CurrentUserID(c), page, perPage)
	if err != nil {
		apperror.WriteHTTP(c, err)
		return
	}
	response.OKWithMeta(c, "bookings retrieved", result, response.BuildMeta(page, perPage, total))
}

func (h *Handler) ListToday(c *gin.Context) {
	page, _ := strconv.Atoi(c.Query("page"))
	perPage, _ := strconv.Atoi(c.Query("limit"))
	date := c.Query("date")
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	result, total, err := h.usecase.ListToday(c.Request.Context(), date, page, perPage)
	if err != nil {
		apperror.WriteHTTP(c, err)
		return
	}
	response.OKWithMeta(c, "today's bookings retrieved", result, response.BuildMeta(page, perPage, total))
}

func (h *Handler) ListAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.Query("page"))
	perPage, _ := strconv.Atoi(c.Query("limit"))
	result, total, err := h.usecase.ListAll(c.Request.Context(), c.Query("status"), page, perPage)
	if err != nil {
		apperror.WriteHTTP(c, err)
		return
	}
	response.OKWithMeta(c, "bookings retrieved", result, response.BuildMeta(page, perPage, total))
}

func (h *Handler) CheckIn(c *gin.Context) {
	var req CheckInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request body", nil)
		return
	}
	result, err := h.usecase.CheckIn(c.Request.Context(), req.TicketCode, middleware.CurrentUserID(c))
	if err != nil {
		apperror.WriteHTTP(c, err)
		return
	}
	response.OK(c, "checked in successfully", result)
}

// PaymentWebhook is the Midtrans notification callback — always returns 200
// unless the signature is invalid, matching Midtrans' documented retry
// expectation (a non-200 makes Midtrans retry, which we only want for
// transient failures).
func (h *Handler) PaymentWebhook(c *gin.Context) {
	var notif MidtransNotification
	if err := c.ShouldBindJSON(&notif); err != nil {
		response.BadRequest(c, "invalid notification payload", nil)
		return
	}
	if err := h.usecase.ConfirmPayment(c.Request.Context(), notif); err != nil {
		apperror.WriteHTTP(c, err)
		return
	}
	response.OK(c, "notification processed", nil)
}
