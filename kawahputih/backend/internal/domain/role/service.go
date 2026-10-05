package role

import (
	"context"

	"github.com/kpr-tourism/backend/pkg/apperror"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) ListRoles(ctx context.Context) ([]RoleResponse, error) {
	roles, err := s.repo.ListRoles(ctx)
	if err != nil {
		return nil, apperror.Internal(err)
	}
	return toRoleResponseList(roles), nil
}

func (s *Service) GetRoleNames(ctx context.Context, userID string) ([]string, error) {
	names, err := s.repo.GetRoleNamesForUser(ctx, userID)
	if err != nil {
		return nil, apperror.Internal(err)
	}
	return names, nil
}

// AssignDefaultRole gives a brand-new user (self-registered or via Google)
// the "visitor" role. Idempotent — if the user somehow already has a role
// (e.g. a retried registration call), this is a no-op rather than an error.
func (s *Service) AssignDefaultRole(ctx context.Context, userID string) error {
	hasRole, err := s.repo.UserHasAnyRole(ctx, userID)
	if err != nil {
		return apperror.Internal(err)
	}
	if hasRole {
		return nil
	}
	defaultRole, err := s.repo.FindRoleByName(ctx, DefaultRoleName)
	if err != nil {
		return apperror.Internal(err)
	}
	if defaultRole == nil {
		return ErrRoleNotFound
	}
	if err := s.repo.AssignRole(ctx, userID, defaultRole.ID); err != nil {
		return apperror.Internal(err)
	}
	return nil
}

func (s *Service) ReplaceRoles(ctx context.Context, userID string, roleNames []string) error {
	roles, err := s.repo.FindRolesByNames(ctx, roleNames)
	if err != nil {
		return apperror.Internal(err)
	}
	roleIDs := make([]string, 0, len(roles))
	for _, r := range roles {
		roleIDs = append(roleIDs, r.ID)
	}
	if err := s.repo.ReplaceRoles(ctx, userID, roleIDs); err != nil {
		return apperror.Internal(err)
	}
	return nil
}
