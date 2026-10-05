package auth

import (
	"github.com/go-playground/validator/v10"
	"github.com/kpr-tourism/backend/pkg/response"
)

// validate is package-scoped (one instance per domain) rather than a single
// global shared across all 7 domains — this matches Part 2.2's "each domain
// is independent" principle: a domain never reaches into another domain's
// package-level state.
var validate = validator.New()

func Validate(s interface{}) []response.FieldError {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}
	var out []response.FieldError
	for _, fe := range err.(validator.ValidationErrors) {
		out = append(out, response.FieldError{Field: fe.Field(), Message: friendlyMessage(fe)})
	}
	return out
}

func friendlyMessage(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return fe.Field() + " is required"
	case "email":
		return fe.Field() + " must be a valid email address"
	case "min":
		return fe.Field() + " must be at least " + fe.Param() + " characters"
	case "max":
		return fe.Field() + " must be at most " + fe.Param() + " characters"
	default:
		return fe.Field() + " is invalid"
	}
}
