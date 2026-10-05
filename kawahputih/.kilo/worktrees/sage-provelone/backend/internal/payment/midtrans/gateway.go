// Package midtrans adapts the Midtrans Snap API to whatever domain needs a
// PaymentGateway (currently booking.PaymentGateway). This is the only file
// allowed to know Midtrans-specific request/response shapes, auth scheme,
// or endpoint URLs — swapping to Xendit later means writing a new package
// implementing the same interface, zero changes anywhere else.
package midtrans

import (
	"bytes"
	"context"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
)

type Config struct {
	ServerKey    string
	ClientKey    string
	IsProduction bool
}

type Gateway struct {
	cfg    Config
	client *http.Client
}

func NewGateway(cfg Config) *Gateway {
	return &Gateway{cfg: cfg, client: &http.Client{}}
}

func (g *Gateway) snapBaseURL() string {
	if g.cfg.IsProduction {
		return "https://app.midtrans.com/snap/v1"
	}
	return "https://app.sandbox.midtrans.com/snap/v1"
}

type snapRequest struct {
	TransactionDetails struct {
		OrderID     string `json:"order_id"`
		GrossAmount int64  `json:"gross_amount"`
	} `json:"transaction_details"`
	CustomerDetails struct {
		FirstName string `json:"first_name"`
		Email     string `json:"email"`
	} `json:"customer_details"`
}

type snapResponse struct {
	Token         string   `json:"token"`
	RedirectURL   string   `json:"redirect_url"`
	ErrorMessages []string `json:"error_messages"`
}

// CreateTransaction satisfies booking.PaymentGateway. Auth is HTTP Basic
// with the server key as username and an empty password, per Midtrans'
// documented scheme.
func (g *Gateway) CreateTransaction(ctx context.Context, orderID string, grossAmount int64, customerName, customerEmail, itemName string) (string, error) {
	var body snapRequest
	body.TransactionDetails.OrderID = orderID
	body.TransactionDetails.GrossAmount = grossAmount
	body.CustomerDetails.FirstName = customerName
	body.CustomerDetails.Email = customerEmail

	payload, err := json.Marshal(body)
	if err != nil {
		return "", err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, g.snapBaseURL()+"/transactions", bytes.NewReader(payload))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.SetBasicAuth(g.cfg.ServerKey, "")

	resp, err := g.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var snapResp snapResponse
	if err := json.NewDecoder(resp.Body).Decode(&snapResp); err != nil {
		return "", err
	}
	if resp.StatusCode >= 300 {
		return "", fmt.Errorf("midtrans: create transaction failed (%d): %v", resp.StatusCode, snapResp.ErrorMessages)
	}
	return snapResp.RedirectURL, nil
}

// VerifySignature reproduces Midtrans' documented formula:
// SHA512(order_id + status_code + gross_amount + server_key). MUST be
// checked before trusting any webhook payload.
func (g *Gateway) VerifySignature(orderID, statusCode, grossAmount, signatureKey string) bool {
	raw := orderID + statusCode + grossAmount + g.cfg.ServerKey
	sum := sha512.Sum512([]byte(raw))
	return hex.EncodeToString(sum[:]) == signatureKey
}
