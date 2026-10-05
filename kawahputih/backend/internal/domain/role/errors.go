package role

import "github.com/kpr-tourism/backend/pkg/apperror"

var (
	ErrRoleNotFound = apperror.NotFound("role not found")
)
