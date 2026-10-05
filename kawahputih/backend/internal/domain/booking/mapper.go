package booking

import "time"

func toResponse(b *Booking) Response {
	var checkedInAt *string
	if b.CheckedInAt != nil {
		s := b.CheckedInAt.Format(time.RFC3339)
		checkedInAt = &s
	}
	return Response{
		ID: b.ID, UserID: b.UserID, PackageID: b.PackageID, VisitDate: b.VisitDate.Format("2006-01-02"),
		Quantity: b.Quantity, TotalCents: b.TotalCents(), Currency: b.Currency, Status: b.Status,
		TicketCode: b.TicketCode, CheckedInAt: checkedInAt,
	}
}

func toResponseList(bookings []Booking) []Response {
	out := make([]Response, 0, len(bookings))
	for i := range bookings {
		out = append(out, toResponse(&bookings[i]))
	}
	return out
}
