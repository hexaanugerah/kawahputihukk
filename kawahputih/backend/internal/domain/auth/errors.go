package auth

import "github.com/kpr-tourism/backend/pkg/apperror"

// Every domain has its own named errors wrapping a shared Kind — handlers
// never see a raw database error or a generic "something went wrong".
//
// .WithCode(...) is applied at var-declaration time only (never at request
// time) — these are package-level singletons read concurrently by every
// request, so mutating them after init would be a data race. Only errors
// with an entry in Part 2.6's catalog get a code; the rest are left as-is
// rather than inventing codes the spec doesn't define.
var (
	ErrUserNotFound         = apperror.NotFound("user not found").WithCode("USER_001")
	ErrEmailAlreadyExists   = apperror.Conflict("email is already registered")
	ErrInvalidCredentials   = apperror.Unauthorized("invalid email or password").WithCode("AUTH_001")
	ErrAccountDeactivated   = apperror.Forbidden("this account has been deactivated")
	ErrInvalidToken         = apperror.Unauthorized("invalid or expired token").WithCode("AUTH_002")
	ErrTokenRevoked         = apperror.Unauthorized("refresh token has been revoked, please log in again").WithCode("AUTH_002")
	ErrOAuthNotConfigured   = apperror.Validation("Google OAuth is not configured on this server")
	ErrOAuthEmailUnverified = apperror.Unauthorized("Google account email is not verified")
)
