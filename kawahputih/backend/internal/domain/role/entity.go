package role

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Base struct {
	ID        string         `gorm:"type:char(36);primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (b *Base) BeforeCreate(tx *gorm.DB) error {
	if b.ID == "" {
		b.ID = uuid.NewString()
	}
	return nil
}

type Role struct {
	Base
	Name        string       `gorm:"type:varchar(100);uniqueIndex;not null" json:"name"`
	Description string       `gorm:"type:varchar(255)" json:"description"`
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
}

func (Role) TableName() string { return "roles" }

type Permission struct {
	Base
	Code        string `gorm:"type:varchar(100);uniqueIndex;not null" json:"code"`
	Description string `gorm:"type:varchar(255)" json:"description"`
}

func (Permission) TableName() string { return "permissions" }

// userRole is the join table row. It is intentionally unexported and never
// used as a GORM association back to auth.User — the role domain doesn't
// import the auth domain's User struct at all, only its ID (a bare string).
// This is how "each domain is independent" (Part 2.2) survives a
// necessarily-relational fact (users have roles): the relationship is
// modeled at the database/table level, not the Go type level.
type userRole struct {
	UserID string `gorm:"column:user_id"`
	RoleID string `gorm:"column:role_id"`
}

func (userRole) TableName() string { return "user_roles" }

const DefaultRoleName = "visitor"
