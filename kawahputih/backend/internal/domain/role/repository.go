package role

import (
	"context"
	"errors"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Repository interface {
	ListRoles(ctx context.Context) ([]Role, error)
	FindRoleByName(ctx context.Context, name string) (*Role, error)
	FindRolesByNames(ctx context.Context, names []string) ([]Role, error)

	GetRoleNamesForUser(ctx context.Context, userID string) ([]string, error)
	UserHasAnyRole(ctx context.Context, userID string) (bool, error)
	AssignRole(ctx context.Context, userID, roleID string) error
	ReplaceRoles(ctx context.Context, userID string, roleIDs []string) error
}

type repository struct{ db *gorm.DB }

func NewRepository(db *gorm.DB) Repository { return &repository{db: db} }

func (r *repository) ListRoles(ctx context.Context) ([]Role, error) {
	var roles []Role
	err := r.db.WithContext(ctx).Preload("Permissions").Find(&roles).Error
	return roles, err
}

func (r *repository) FindRoleByName(ctx context.Context, name string) (*Role, error) {
	var role Role
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&role).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *repository) FindRolesByNames(ctx context.Context, names []string) ([]Role, error) {
	var roles []Role
	err := r.db.WithContext(ctx).Where("name IN ?", names).Find(&roles).Error
	return roles, err
}

// GetRoleNamesForUser joins the raw user_roles table against roles — no
// GORM association traversal through a User struct, since this domain
// never imports one.
func (r *repository) GetRoleNamesForUser(ctx context.Context, userID string) ([]string, error) {
	var names []string
	err := r.db.WithContext(ctx).
		Table("roles").
		Joins("JOIN user_roles ON user_roles.role_id = roles.id").
		Where("user_roles.user_id = ?", userID).
		Pluck("roles.name", &names).Error
	return names, err
}

func (r *repository) UserHasAnyRole(ctx context.Context, userID string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Table("user_roles").Where("user_id = ?", userID).Count(&count).Error
	return count > 0, err
}

func onConflictDoNothing() clause.OnConflict {
	return clause.OnConflict{DoNothing: true}
}

func (r *repository) AssignRole(ctx context.Context, userID, roleID string) error {
	return r.db.WithContext(ctx).Table("user_roles").
		Clauses(onConflictDoNothing()).
		Create(&userRole{UserID: userID, RoleID: roleID}).Error
}

// ReplaceRoles clears and re-assigns atomically — without a transaction, a
// crash between clear and re-insert would leave the account with zero
// roles (effectively locked out), which is the exact bug this guards
// against.
func (r *repository) ReplaceRoles(ctx context.Context, userID string, roleIDs []string) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Table("user_roles").Where("user_id = ?", userID).Delete(&userRole{}).Error; err != nil {
			return err
		}
		for _, roleID := range roleIDs {
			if err := tx.Table("user_roles").Create(&userRole{UserID: userID, RoleID: roleID}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
