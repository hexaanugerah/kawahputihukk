package role

import "context"

// Usecase is a thin pass-through here — role management has no other
// domain to coordinate with, so UseCase and Service end up 1:1. Kept as a
// separate layer anyway (rather than skipped) for structural consistency
// with the other 6 domains, per Part 2.2's "every domain MUST have the same
// structure".
type Usecase struct {
	service *Service
}

func NewUsecase(service *Service) *Usecase {
	return &Usecase{service: service}
}

func (u *Usecase) ListRoles(ctx context.Context) ([]RoleResponse, error) {
	return u.service.ListRoles(ctx)
}

func (u *Usecase) AssignRoles(ctx context.Context, userID string, roleNames []string) error {
	return u.service.ReplaceRoles(ctx, userID, roleNames)
}
