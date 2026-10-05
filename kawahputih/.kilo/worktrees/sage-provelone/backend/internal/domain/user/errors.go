package user

import "github.com/kpr-tourism/backend/pkg/apperror"

// USER_001 per Part 2.6's error code catalog — same code auth.ErrUserNotFound
// uses, since both represent the same real-world condition (no code is
// "owned" by a Go package, only by the concept it names).
var ErrUserNotFound = apperror.NotFound("user not found").WithCode("USER_001")
