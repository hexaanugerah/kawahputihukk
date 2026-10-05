package user

import "time"

// AdminUser is THIS domain's view of the users table — scoped only to what
// staff-management cares about (identity + active status). It does not
// include PasswordHash, GoogleID, or token-related concerns; those belong
// to the auth domain's own User struct mapped to the same table. Two
// domains mapping the same table with different structs is a deliberate
// trade-off documented here: it keeps each domain's model honest about what
// IT needs, at the cost of both domains needing their own migration
// awareness of the users table's shape.
type AdminUser struct {
	ID         string    `gorm:"type:char(36);primaryKey" json:"id"`
	Name       string    `json:"name"`
	Email      string    `json:"email"`
	Phone      string    `json:"phone"`
	IsActive   bool      `json:"is_active"`
	IsVerified bool      `json:"is_verified"`
	CreatedAt  time.Time `json:"created_at"`
}

func (AdminUser) TableName() string { return "users" }
