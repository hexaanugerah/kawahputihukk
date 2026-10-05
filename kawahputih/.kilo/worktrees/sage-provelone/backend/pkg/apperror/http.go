package apperror

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/pkg/response"
)

// errorBody is the same shape as response.Envelope but adds an optional
// "code" field — kept as a local type rather than modifying
// response.Envelope globally, since most responses (success responses,
// non-catalog errors) never carry a code at all.
type errorBody struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Code    string `json:"code,omitempty"`
}

// WriteHTTP is called by every domain's handler.go — one central place
// mapping Kind -> HTTP status, so all 7 domains respond identically for the
// same class of error (Part 1.3 "Every API returns standardized JSON").
// Business-logic validation errors from service/usecase layers go through
// here as KindValidation and get the plain-message 422 shape; the
// per-field 422 shape (response.ValidationFailed) is used directly by
// handlers for request-binding validation, before an AppError even exists.
func WriteHTTP(c *gin.Context, err error) {
	ae, ok := As(err)
	if !ok {
		c.JSON(http.StatusInternalServerError, errorBody{Success: false, Message: "internal server error"})
		return
	}

	status := statusFor(ae.Kind)
	if ae.Code != "" {
		c.JSON(status, errorBody{Success: false, Message: ae.Message, Code: ae.Code})
		return
	}
	// No catalog code — fall back to the plain envelope so existing
	// response.* helpers (and their exact status-per-Kind behavior) stay
	// the single source of truth for callers that don't check the code.
	switch ae.Kind {
	case KindValidation:
		c.JSON(http.StatusUnprocessableEntity, errorBody{Success: false, Message: ae.Message})
	case KindNotFound:
		response.NotFound(c, ae.Message)
	case KindConflict:
		response.Conflict(c, ae.Message)
	case KindUnauthorized:
		response.Unauthorized(c, ae.Message)
	case KindForbidden:
		response.Forbidden(c, ae.Message)
	case KindRateLimited:
		response.TooManyRequests(c, ae.Message)
	default:
		c.JSON(http.StatusInternalServerError, errorBody{Success: false, Message: "internal server error"})
	}
}

func statusFor(kind Kind) int {
	switch kind {
	case KindValidation:
		return http.StatusUnprocessableEntity
	case KindNotFound:
		return http.StatusNotFound
	case KindConflict:
		return http.StatusConflict
	case KindUnauthorized:
		return http.StatusUnauthorized
	case KindForbidden:
		return http.StatusForbidden
	case KindRateLimited:
		return http.StatusTooManyRequests
	default:
		return http.StatusInternalServerError
	}
}
