package booking

import (
	"context"
	"errors"

	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, b *Booking) error
	Update(ctx context.Context, b *Booking) error
	FindByID(ctx context.Context, id string) (*Booking, error)
	FindByTicketCode(ctx context.Context, ticketCode string) (*Booking, error)
	ListByUser(ctx context.Context, userID string, offset, limit int) ([]Booking, int64, error)
	ListByVisitDate(ctx context.Context, date string, offset, limit int) ([]Booking, int64, error)
	ListAll(ctx context.Context, status string, offset, limit int) ([]Booking, int64, error)
	SumConfirmedQuantityForDate(ctx context.Context, packageID, date string) (int, error)
}

type repository struct{ db *gorm.DB }

func NewRepository(db *gorm.DB) Repository { return &repository{db: db} }

func (r *repository) Create(ctx context.Context, b *Booking) error {
	return r.db.WithContext(ctx).Create(b).Error
}
func (r *repository) Update(ctx context.Context, b *Booking) error {
	return r.db.WithContext(ctx).Save(b).Error
}

func (r *repository) FindByID(ctx context.Context, id string) (*Booking, error) {
	return r.findOne(ctx, "id = ?", id)
}

func (r *repository) FindByTicketCode(ctx context.Context, ticketCode string) (*Booking, error) {
	return r.findOne(ctx, "ticket_code = ?", ticketCode)
}

func (r *repository) findOne(ctx context.Context, where string, arg interface{}) (*Booking, error) {
	var b Booking
	err := r.db.WithContext(ctx).First(&b, where, arg).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *repository) ListByUser(ctx context.Context, userID string, offset, limit int) ([]Booking, int64, error) {
	return r.list(ctx, "user_id = ?", []interface{}{userID}, "created_at DESC", offset, limit)
}

func (r *repository) ListByVisitDate(ctx context.Context, date string, offset, limit int) ([]Booking, int64, error) {
	return r.list(ctx, "visit_date = ?", []interface{}{date}, "created_at ASC", offset, limit)
}

func (r *repository) ListAll(ctx context.Context, status string, offset, limit int) ([]Booking, int64, error) {
	if status == "" {
		return r.list(ctx, "", nil, "created_at DESC", offset, limit)
	}
	return r.list(ctx, "status = ?", []interface{}{status}, "created_at DESC", offset, limit)
}

func (r *repository) list(ctx context.Context, where string, args []interface{}, order string, offset, limit int) ([]Booking, int64, error) {
	q := r.db.WithContext(ctx).Model(&Booking{})
	if where != "" {
		q = q.Where(where, args...)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var bookings []Booking
	if err := q.Order(order).Offset(offset).Limit(limit).Find(&bookings).Error; err != nil {
		return nil, 0, err
	}
	return bookings, total, nil
}

func (r *repository) SumConfirmedQuantityForDate(ctx context.Context, packageID, date string) (int, error) {
	var total int64
	err := r.db.WithContext(ctx).Model(&Booking{}).
		Where("package_id = ? AND visit_date = ? AND status IN ?", packageID, date,
			[]string{StatusPendingPayment, StatusPaid, StatusCheckedIn}).
		Select("COALESCE(SUM(quantity), 0)").Row().Scan(&total)
	return int(total), err
}
