package gallery

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

func (s *Service) Create(ctx context.Context, uploaderID string, req CreateRequest) (*Item, error) {
	item := &Item{Title: req.Title, ImageURL: req.ImageURL, Category: req.Category, SortOrder: req.SortOrder, UploadedBy: uploaderID}
	if err := s.repo.Create(ctx, item); err != nil {
		return nil, apperror.Internal(err)
	}
	return item, nil
}

func (s *Service) Delete(ctx context.Context, id, actorID string) error {
	item, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return apperror.Internal(err)
	}
	if item == nil {
		return ErrItemNotFound
	}
	item.DeletedBy = &actorID
	if err := s.repo.Update(ctx, item); err != nil {
		return apperror.Internal(err)
	}
	if err := s.repo.Delete(ctx, id); err != nil {
		return apperror.Internal(err)
	}
	return nil
}

func (s *Service) List(ctx context.Context, offset, limit int, category string) ([]Item, int64, error) {
	items, total, err := s.repo.List(ctx, offset, limit, category)
	if err != nil {
		return nil, 0, apperror.Internal(err)
	}
	return items, total, nil
}
