package gallery

type CreateRequest struct {
	Title     string `json:"title" validate:"required,min=3,max=200"`
	ImageURL  string `json:"image_url" validate:"required,url"`
	Category  string `json:"category" validate:"omitempty,max=100"`
	SortOrder int    `json:"sort_order"`
}

type Response struct {
	ID         string `json:"id"`
	Title      string `json:"title"`
	ImageURL   string `json:"image_url"`
	Category   string `json:"category"`
	SortOrder  int    `json:"sort_order"`
	UploadedBy string `json:"uploaded_by"`
}
