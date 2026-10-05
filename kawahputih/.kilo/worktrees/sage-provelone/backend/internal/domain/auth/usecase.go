package auth

import "context"

// RoleProvider is how the auth usecase reaches the role domain WITHOUT
// importing it directly — auth defines the interface it needs, role's
// service satisfies it structurally (Go interfaces are implicit), and
// bootstrap.go wires the concrete instance in. This keeps the dependency
// arrow pointing one way: auth depends on an abstraction it owns, not on
// role's concrete package. Swap in any implementation without auth ever
// importing "internal/domain/role".
type RoleProvider interface {
	AssignDefaultRole(ctx context.Context, userID string) error
	GetRoleNames(ctx context.Context, userID string) ([]string, error)
}

// Usecase connects handler to service and is the ONLY layer allowed to
// coordinate across domains (Part 2.2: "UseCase: Coordinate Services").
// The Service above never calls RoleProvider — only Usecase does.
type Usecase struct {
	service *Service
	roles   RoleProvider
}

func NewUsecase(service *Service, roles RoleProvider) *Usecase {
	return &Usecase{service: service, roles: roles}
}

func (u *Usecase) Register(ctx context.Context, req RegisterRequest) (*AuthResponse, error) {
	user, err := u.service.CreateUser(ctx, req.Name, req.Email, req.Phone, req.Password)
	if err != nil {
		return nil, err
	}
	if err := u.roles.AssignDefaultRole(ctx, user.ID); err != nil {
		return nil, err
	}
	return u.service.IssueTokenPair(ctx, user, []string{"visitor"}, "", "")
}

func (u *Usecase) Login(ctx context.Context, req LoginRequest, userAgent, ip string) (*AuthResponse, error) {
	user, err := u.service.Authenticate(ctx, req.Email, req.Password)
	if err != nil {
		return nil, err
	}
	roleNames, err := u.roles.GetRoleNames(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	return u.service.IssueTokenPair(ctx, user, roleNames, userAgent, ip)
}

func (u *Usecase) Refresh(ctx context.Context, rawRefreshToken string) (*AuthResponse, error) {
	user, userAgent, ip, err := u.service.RefreshTokenPair(ctx, rawRefreshToken)
	if err != nil {
		return nil, err
	}
	roleNames, err := u.roles.GetRoleNames(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	return u.service.IssueTokenPair(ctx, user, roleNames, userAgent, ip)
}

func (u *Usecase) Logout(ctx context.Context, rawRefreshToken string) error {
	return u.service.Logout(ctx, rawRefreshToken)
}

func (u *Usecase) RequestEmailVerification(ctx context.Context, email string) error {
	return u.service.RequestEmailVerification(ctx, email)
}

func (u *Usecase) VerifyEmail(ctx context.Context, token string) error {
	return u.service.VerifyEmail(ctx, token)
}

func (u *Usecase) ForgotPassword(ctx context.Context, email string) error {
	return u.service.ForgotPassword(ctx, email)
}

func (u *Usecase) ResetPassword(ctx context.Context, token, newPassword string) error {
	return u.service.ResetPassword(ctx, token, newPassword)
}

func (u *Usecase) GoogleAuthURL(state string) (string, error) {
	return u.service.GoogleAuthURL(state)
}

func (u *Usecase) GoogleLogin(ctx context.Context, code string) (*AuthResponse, error) {
	user, err := u.service.GoogleExchange(ctx, code)
	if err != nil {
		return nil, err
	}
	if err := u.roles.AssignDefaultRole(ctx, user.ID); err != nil {
		// no-op if already assigned — see role domain's AssignDefaultRole
		return nil, err
	}
	roleNames, err := u.roles.GetRoleNames(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	return u.service.IssueTokenPair(ctx, user, roleNames, "", "")
}
