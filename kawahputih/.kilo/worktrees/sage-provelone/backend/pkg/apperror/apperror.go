// Package apperror provides the Kind taxonomy every domain's errors.go
// builds custom sentinel errors on top of (ErrUserNotFound, ErrBookingExpired,
// etc — see Part 2.2 "ERROR PACKAGE"). Domains never return a raw database
// error to a handler; they wrap it in one of their own named errors, which
// in turn wraps a Kind here so the handler layer can map it to an HTTP
// status without needing to know about every domain's error types.
package apperror

import "errors"

type Kind string

const (
	KindValidation   Kind = "validation"
	KindNotFound     Kind = "not_found"
	KindConflict     Kind = "conflict"
	KindUnauthorized Kind = "unauthorized"
	KindForbidden    Kind = "forbidden"
	KindInternal     Kind = "internal"
	KindRateLimited  Kind = "rate_limited"
)

type AppError struct {
	Kind    Kind
	Message string
	Code    string // e.g. "AUTH_001" — Part 2.6's error code catalog; empty for errors not in that catalog
	Err     error
}

func (e *AppError) Error() string {
	if e.Message != "" {
		return e.Message
	}
	if e.Err != nil {
		return e.Err.Error()
	}
	return string(e.Kind)
}

func (e *AppError) Unwrap() error { return e.Err }

func New(kind Kind, message string, wrapped error) *AppError {
	return &AppError{Kind: kind, Message: message, Err: wrapped}
}

// WithCode attaches a Part 2.6 catalog code to an existing AppError,
// e.g. apperror.Unauthorized("invalid email or password").WithCode("AUTH_001").
// Kept as a chained call rather than adding Code to every constructor
// below so domains opt into a code only where Part 2.6 actually defines
// one — not every error in the system has a catalog entry.
func (e *AppError) WithCode(code string) *AppError {
	e.Code = code
	return e
}

func NotFound(message string) *AppError     { return New(KindNotFound, message, nil) }
func Validation(message string) *AppError   { return New(KindValidation, message, nil) }
func Conflict(message string) *AppError     { return New(KindConflict, message, nil) }
func Unauthorized(message string) *AppError { return New(KindUnauthorized, message, nil) }
func Forbidden(message string) *AppError    { return New(KindForbidden, message, nil) }
func Internal(err error) *AppError          { return New(KindInternal, "internal server error", err) }

func As(err error) (*AppError, bool) {
	var ae *AppError
	if errors.As(err, &ae) {
		return ae, true
	}
	return nil, false
}
