package auth

// mapper.go is the only place allowed to translate between the GORM entity
// (User) and the wire-facing DTO (UserResponse) — services/usecases pass
// entities around internally, handlers only ever see DTOs.
func toUserResponse(u *User) UserResponse {
	return UserResponse{ID: u.ID, Name: u.Name, Email: u.Email, Phone: u.Phone, IsVerified: u.IsVerified}
}
