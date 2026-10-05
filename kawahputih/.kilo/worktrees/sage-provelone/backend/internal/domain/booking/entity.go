package booking

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

// Booking is a plain GORM model per Part 2.2's "Entity contains GORM Model
// only, no business logic" — unlike the earlier DDD aggregate, status
// transitions are NOT methods on this struct. That enforcement moved to
// service.go instead. The trade-off (documented plainly): invariants are
// now enforced by service-layer discipline rather than the compiler/struct
// encapsulation — nothing stops another file in this package from mutating
// Status directly. This is the concrete cost of the migration from DDD to
// Part 2.2's flatter model; it is a real reduction in safety, not a
// stylistic wash.
type Booking struct {
	Base
	UserID      string     `gorm:"type:char(36);index;not null" json:"user_id"`
	PackageID   string     `gorm:"type:char(36);index;not null" json:"package_id"`
	VisitDate   time.Time  `gorm:"type:date;index;not null" json:"visit_date"`
	Quantity    int        `gorm:"not null" json:"quantity"`
	UnitCents   int64      `gorm:"not null" json:"unit_cents"`
	Currency    string     `gorm:"type:varchar(3);not null;default:IDR" json:"currency"`
	Status      string     `gorm:"type:varchar(20);index;not null;default:pending_payment" json:"status"`
	PaymentRef  string     `gorm:"type:varchar(100);index" json:"payment_ref"`
	TicketCode  string     `gorm:"type:varchar(20);uniqueIndex" json:"ticket_code"`
	CheckedInAt *time.Time `json:"checked_in_at,omitempty"`
	CheckedInBy string     `gorm:"type:char(36)" json:"checked_in_by"`
}

func (Booking) TableName() string { return "bookings" }

func (b *Booking) TotalCents() int64 { return b.UnitCents * int64(b.Quantity) }

const (
	StatusPendingPayment = "pending_payment"
	StatusPaid           = "paid"
	StatusCancelled      = "cancelled"
	StatusExpired        = "expired"
	StatusCheckedIn      = "checked_in"
)
