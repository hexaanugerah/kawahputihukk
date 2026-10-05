package booking

import (
	"context"
	"crypto/rand"
	"encoding/base32"
	"strings"
	"time"

	"github.com/kpr-tourism/backend/pkg/apperror"
)

// PaymentGateway is defined here (not imported from another package) so
// this domain owns the exact shape it needs — the concrete Midtrans
// implementation lives in internal/payment/midtrans and is wired in at
// bootstrap time. Same pattern as auth.RoleProvider: depend on an
// interface you own, not a concrete package from elsewhere.
type PaymentGateway interface {
	CreateTransaction(ctx context.Context, orderID string, grossAmount int64, customerName, customerEmail, itemName string) (redirectURL string, err error)
	VerifySignature(orderID, statusCode, grossAmount, signatureKey string) bool
}

// PackagePricing is what this domain needs from the tourism package domain
// — never a direct import of tourismpackage.Package.
type PackagePricing struct {
	Name        string
	UnitCents   int64
	Currency    string
	MaxCapacity int
	IsActive    bool
}

type PackageCatalog interface {
	GetPricing(ctx context.Context, packageID string) (PackagePricing, error)
}

// Service holds every business rule for the booking domain. Every status
// transition is a method here — CreateBooking / ConfirmPayment / Cancel /
// CheckIn — and every one of them is the ONLY sanctioned way that field
// gets mutated. Nothing enforces that at the compiler level anymore (see
// entity.go's comment on this trade-off); it's enforced by "only call these
// methods, never touch repo.Update with a hand-mutated Status field",
// which is a code-review discipline, not a language guarantee.
type Service struct {
	repo    Repository
	gateway PaymentGateway
}

func NewService(repo Repository, gateway PaymentGateway) *Service {
	return &Service{repo: repo, gateway: gateway}
}

func (s *Service) CreateBooking(ctx context.Context, userID string, req CreateRequest, pricing PackagePricing) (*Booking, string, error) {
	if req.Quantity <= 0 {
		return nil, "", ErrInvalidQuantity
	}
	if !pricing.IsActive {
		return nil, "", ErrPackageInactive
	}
	visitDate, err := time.Parse("2006-01-02", req.VisitDate)
	if err != nil {
		return nil, "", apperror.Validation("visit_date must be in YYYY-MM-DD format")
	}
	if visitDate.Before(time.Now().Truncate(24 * time.Hour)) {
		return nil, "", ErrPastVisitDate
	}

	if pricing.MaxCapacity > 0 {
		booked, err := s.repo.SumConfirmedQuantityForDate(ctx, req.PackageID, req.VisitDate)
		if err != nil {
			return nil, "", apperror.Internal(err)
		}
		if booked+req.Quantity > pricing.MaxCapacity {
			return nil, "", ErrCapacityExceeded
		}
	}

	b := &Booking{
		UserID: userID, PackageID: req.PackageID, VisitDate: visitDate, Quantity: req.Quantity,
		UnitCents: pricing.UnitCents, Currency: pricing.Currency, Status: StatusPendingPayment,
	}
	if err := s.repo.Create(ctx, b); err != nil {
		return nil, "", apperror.Internal(err)
	}

	redirectURL, err := s.gateway.CreateTransaction(ctx, b.ID, b.TotalCents(), req.CustomerName, req.CustomerEmail, pricing.Name)
	if err != nil {
		return nil, "", apperror.Internal(err)
	}
	return b, redirectURL, nil
}

// ConfirmPayment is idempotent by design — a webhook redelivery hitting an
// already-paid booking is a no-op, not an error, since payment gateways are
// expected to redeliver notifications.
func (s *Service) ConfirmPayment(ctx context.Context, notif MidtransNotification) error {
	if !s.gateway.VerifySignature(notif.OrderID, notif.StatusCode, notif.GrossAmount, notif.SignatureKey) {
		return ErrSignatureInvalid
	}
	if notif.TransactionStatus != "capture" && notif.TransactionStatus != "settlement" {
		return nil
	}

	b, err := s.repo.FindByID(ctx, notif.OrderID)
	if err != nil {
		return apperror.Internal(err)
	}
	if b == nil {
		return ErrBookingNotFound
	}
	if b.Status == StatusPaid {
		return nil
	}
	if b.Status == StatusExpired {
		return ErrBookingExpired
	}
	if b.Status != StatusPendingPayment {
		return ErrInvalidTransition
	}

	ticketCode, err := generateTicketCode()
	if err != nil {
		return apperror.Internal(err)
	}
	b.Status, b.PaymentRef, b.TicketCode = StatusPaid, notif.OrderID, ticketCode
	if err := s.repo.Update(ctx, b); err != nil {
		return apperror.Internal(err)
	}
	return nil
}

func (s *Service) Cancel(ctx context.Context, bookingID, userID, reason string) error {
	b, err := s.repo.FindByID(ctx, bookingID)
	if err != nil {
		return apperror.Internal(err)
	}
	if b == nil {
		return ErrBookingNotFound
	}
	if b.UserID != userID {
		return ErrNotOwner
	}
	if b.Status != StatusPendingPayment {
		return ErrInvalidTransition
	}
	b.Status = StatusCancelled
	if err := s.repo.Update(ctx, b); err != nil {
		return apperror.Internal(err)
	}
	return nil
}

// Expire is called by the scheduler (internal/scheduler/expired_booking.go)
// for bookings left unpaid past the payment window.
func (s *Service) Expire(ctx context.Context, bookingID string) error {
	b, err := s.repo.FindByID(ctx, bookingID)
	if err != nil {
		return apperror.Internal(err)
	}
	if b == nil || b.Status != StatusPendingPayment {
		return nil
	}
	b.Status = StatusExpired
	if err := s.repo.Update(ctx, b); err != nil {
		return apperror.Internal(err)
	}
	return nil
}

func (s *Service) CheckIn(ctx context.Context, ticketCode, staffUserID string) (*Booking, error) {
	b, err := s.repo.FindByTicketCode(ctx, ticketCode)
	if err != nil {
		return nil, apperror.Internal(err)
	}
	if b == nil {
		return nil, ErrTicketNotFound
	}
	if b.Status == StatusExpired {
		return nil, ErrBookingExpired
	}
	if b.Status != StatusPaid {
		return nil, ErrInvalidTransition
	}
	now := time.Now()
	b.Status, b.CheckedInAt, b.CheckedInBy = StatusCheckedIn, &now, staffUserID
	if err := s.repo.Update(ctx, b); err != nil {
		return nil, apperror.Internal(err)
	}
	return b, nil
}

func (s *Service) Get(ctx context.Context, id string) (*Booking, error) {
	b, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, apperror.Internal(err)
	}
	if b == nil {
		return nil, ErrBookingNotFound
	}
	return b, nil
}

func (s *Service) ListByUser(ctx context.Context, userID string, offset, limit int) ([]Booking, int64, error) {
	b, total, err := s.repo.ListByUser(ctx, userID, offset, limit)
	if err != nil {
		return nil, 0, apperror.Internal(err)
	}
	return b, total, nil
}

func (s *Service) ListByVisitDate(ctx context.Context, date string, offset, limit int) ([]Booking, int64, error) {
	b, total, err := s.repo.ListByVisitDate(ctx, date, offset, limit)
	if err != nil {
		return nil, 0, apperror.Internal(err)
	}
	return b, total, nil
}

func (s *Service) ListAll(ctx context.Context, status string, offset, limit int) ([]Booking, int64, error) {
	b, total, err := s.repo.ListAll(ctx, status, offset, limit)
	if err != nil {
		return nil, 0, apperror.Internal(err)
	}
	return b, total, nil
}

func generateTicketCode() (string, error) {
	b := make([]byte, 10)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	code := base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(b)
	return strings.ToUpper(code[:16]), nil
}
