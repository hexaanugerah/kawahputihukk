package booking

import "github.com/kpr-tourism/backend/pkg/apperror"

var (
	ErrBookingNotFound = apperror.NotFound("booking not found").WithCode("BOOKING_001")
	// ErrBookingExpired is distinct from the generic ErrInvalidTransition
	// below — it's raised specifically when an action targets a booking
	// whose payment window already lapsed (see service.go's CheckIn /
	// ConfirmPayment), matching Part 2.6's BOOKING_002 catalog entry.
	ErrBookingExpired   = apperror.Conflict("this booking has expired and is no longer valid").WithCode("BOOKING_002")
	ErrInvalidQuantity  = apperror.Validation("quantity must be greater than zero")
	ErrPastVisitDate    = apperror.Validation("visit date must be in the future")
	ErrCapacityExceeded = apperror.Conflict("requested quantity exceeds package capacity")
	// ErrPackageInactive maps to Part 2.6's DESTINATION_001 ("Destination
	// Closed") — this project has no separate "destination" domain; the
	// tourism package IS the bookable unit, so "package inactive" is this
	// project's equivalent of "destination closed".
	ErrPackageInactive   = apperror.Conflict("this package is not currently bookable").WithCode("DESTINATION_001")
	ErrInvalidTransition = apperror.Conflict("this action is not valid for the booking's current status")
	ErrNotOwner          = apperror.Forbidden("this booking does not belong to you")
	ErrSignatureInvalid  = apperror.Unauthorized("invalid webhook signature")
	ErrTicketNotFound    = apperror.NotFound("ticket code not found")
)
