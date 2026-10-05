package booking

import "context"

// PackagePricingProvider is how this usecase reaches the tourism package
// domain without importing it — package.Service (aliased tourismpackage)
// satisfies this by exposing a thin adapter method (see bootstrap.go).
type PackagePricingProvider interface {
	GetPricing(ctx context.Context, packageID string) (PackagePricing, error)
}

type Usecase struct {
	service *Service
	catalog PackagePricingProvider
}

func NewUsecase(service *Service, catalog PackagePricingProvider) *Usecase {
	return &Usecase{service: service, catalog: catalog}
}

func (u *Usecase) CreateBooking(ctx context.Context, userID string, req CreateRequest) (*CreateResponse, error) {
	pricing, err := u.catalog.GetPricing(ctx, req.PackageID)
	if err != nil {
		return nil, err
	}
	b, redirectURL, err := u.service.CreateBooking(ctx, userID, req, pricing)
	if err != nil {
		return nil, err
	}
	return &CreateResponse{BookingID: b.ID, RedirectURL: redirectURL, Status: b.Status}, nil
}

func (u *Usecase) ConfirmPayment(ctx context.Context, notif MidtransNotification) error {
	return u.service.ConfirmPayment(ctx, notif)
}

func (u *Usecase) Cancel(ctx context.Context, bookingID, userID, reason string) error {
	return u.service.Cancel(ctx, bookingID, userID, reason)
}

func (u *Usecase) CheckIn(ctx context.Context, ticketCode, staffUserID string) (Response, error) {
	b, err := u.service.CheckIn(ctx, ticketCode, staffUserID)
	if err != nil {
		return Response{}, err
	}
	return toResponse(b), nil
}

func (u *Usecase) Get(ctx context.Context, id string) (Response, error) {
	b, err := u.service.Get(ctx, id)
	if err != nil {
		return Response{}, err
	}
	return toResponse(b), nil
}

func (u *Usecase) ListMine(ctx context.Context, userID string, page, perPage int) ([]Response, int64, error) {
	page, perPage = normalizePaging(page, perPage)
	bookings, total, err := u.service.ListByUser(ctx, userID, (page-1)*perPage, perPage)
	if err != nil {
		return nil, 0, err
	}
	return toResponseList(bookings), total, nil
}

func (u *Usecase) ListToday(ctx context.Context, date string, page, perPage int) ([]Response, int64, error) {
	page, perPage = normalizePaging(page, perPage)
	bookings, total, err := u.service.ListByVisitDate(ctx, date, (page-1)*perPage, perPage)
	if err != nil {
		return nil, 0, err
	}
	return toResponseList(bookings), total, nil
}

func (u *Usecase) ListAll(ctx context.Context, status string, page, perPage int) ([]Response, int64, error) {
	page, perPage = normalizePaging(page, perPage)
	bookings, total, err := u.service.ListAll(ctx, status, (page-1)*perPage, perPage)
	if err != nil {
		return nil, 0, err
	}
	return toResponseList(bookings), total, nil
}

func normalizePaging(page, perPage int) (int, int) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}
	if perPage > 100 {
		perPage = 100
	}
	return page, perPage
}
