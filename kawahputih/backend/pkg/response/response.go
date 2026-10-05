// Package response defines the single JSON envelope every endpoint returns,
// per the project's API Response Standard (Part 1.3 / Part 2.1).
package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Envelope struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
	Errors  interface{} `json:"errors,omitempty"`
}

// Meta field names (page/limit/total/total_pages) match Part 2.6's
// Pagination spec exactly. This is a breaking rename from the previous
// page/per_page/total_items/total_pages shape — the frontend's ApiMeta
// type and every place reading meta.* must be updated alongside this.
type Meta struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// FieldError is one entry in a 422 validation response, per Part 2.6's
// exact shape: {"field": "email", "message": "Email is required"}.
type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func OK(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, Envelope{Success: true, Message: message, Data: data})
}

func OKWithMeta(c *gin.Context, message string, data interface{}, meta *Meta) {
	c.JSON(http.StatusOK, Envelope{Success: true, Message: message, Data: data, Meta: meta})
}

func Created(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusCreated, Envelope{Success: true, Message: message, Data: data})
}

func Fail(c *gin.Context, status int, message string, errs interface{}) {
	c.JSON(status, Envelope{Success: false, Message: message, Errors: errs})
}

func BadRequest(c *gin.Context, message string, errs interface{}) {
	Fail(c, http.StatusBadRequest, message, errs)
}

// ValidationFailed is the dedicated 422 response for request-validation
// errors, per Part 2.6 ("Validation Error -> HTTP 422"). Kept separate from
// BadRequest (400) — a malformed JSON body (can't even parse the request)
// is a 400; a well-formed request that fails field validation is a 422.
// That distinction is what Part 2.6 draws and the previous implementation
// collapsed both into 400.
func ValidationFailed(c *gin.Context, errs []FieldError) {
	Fail(c, http.StatusUnprocessableEntity, "Validation Failed", errs)
}

func Unauthorized(c *gin.Context, message string) { Fail(c, http.StatusUnauthorized, message, nil) }
func Forbidden(c *gin.Context, message string)    { Fail(c, http.StatusForbidden, message, nil) }
func NotFound(c *gin.Context, message string)     { Fail(c, http.StatusNotFound, message, nil) }
func Conflict(c *gin.Context, message string)     { Fail(c, http.StatusConflict, message, nil) }
func TooManyRequests(c *gin.Context, message string) {
	Fail(c, http.StatusTooManyRequests, message, nil)
}
func InternalError(c *gin.Context, message string) {
	if message == "" {
		message = "internal server error"
	}
	Fail(c, http.StatusInternalServerError, message, nil)
}

// BuildMeta computes total_pages from a limit/total pair. `page` and
// `limit` here are the values actually used for the query (after any
// clamping the caller already applied), not raw user input.
func BuildMeta(page, limit int, total int64) *Meta {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	return &Meta{Page: page, Limit: limit, Total: total, TotalPages: totalPages}
}
