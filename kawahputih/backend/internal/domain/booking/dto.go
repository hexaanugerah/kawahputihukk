package booking

type CreateRequest struct {
	PackageID     string `json:"package_id" validate:"required"`
	VisitDate     string `json:"visit_date" validate:"required"` // YYYY-MM-DD
	Quantity      int    `json:"quantity" validate:"required,min=1"`
	CustomerName  string `json:"customer_name" validate:"required"`
	CustomerEmail string `json:"customer_email" validate:"required,email"`
}

type CreateResponse struct {
	BookingID   string `json:"booking_id"`
	RedirectURL string `json:"redirect_url"`
	Status      string `json:"status"`
}

type CheckInRequest struct {
	TicketCode string `json:"ticket_code" validate:"required"`
}

type MidtransNotification struct {
	OrderID           string `json:"order_id"`
	StatusCode        string `json:"status_code"`
	GrossAmount       string `json:"gross_amount"`
	SignatureKey      string `json:"signature_key"`
	TransactionStatus string `json:"transaction_status"`
}

type Response struct {
	ID          string  `json:"id"`
	UserID      string  `json:"user_id"`
	PackageID   string  `json:"package_id"`
	VisitDate   string  `json:"visit_date"`
	Quantity    int     `json:"quantity"`
	TotalCents  int64   `json:"total_cents"`
	Currency    string  `json:"currency"`
	Status      string  `json:"status"`
	TicketCode  string  `json:"ticket_code"`
	CheckedInAt *string `json:"checked_in_at,omitempty"`
}
