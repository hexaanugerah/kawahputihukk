package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/pkg/jwtutil"
	"github.com/kpr-tourism/backend/pkg/response"
)

const (
	ctxUserIDKey = "auth_user_id"
	ctxRolesKey  = "auth_user_roles"
)

func RequireAuth(jwtManager *jwtutil.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			response.Unauthorized(c, "missing or malformed Authorization header")
			c.Abort()
			return
		}
		claims, err := jwtManager.ParseAccessToken(strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			response.Unauthorized(c, "invalid or expired access token")
			c.Abort()
			return
		}
		c.Set(ctxUserIDKey, claims.UserID)
		c.Set(ctxRolesKey, claims.Roles)
		c.Next()
	}
}

func RequireRole(allowed ...string) gin.HandlerFunc {
	allowedSet := make(map[string]struct{}, len(allowed))
	for _, r := range allowed {
		allowedSet[r] = struct{}{}
	}
	return func(c *gin.Context) {
		rolesRaw, exists := c.Get(ctxRolesKey)
		if !exists {
			response.Forbidden(c, "no role information on request context")
			c.Abort()
			return
		}
		roles, _ := rolesRaw.([]string)
		for _, r := range roles {
			if _, ok := allowedSet[r]; ok {
				c.Next()
				return
			}
		}
		response.Forbidden(c, "you do not have permission to access this resource")
		c.Abort()
	}
}

func CurrentUserID(c *gin.Context) string {
	v, _ := c.Get(ctxUserIDKey)
	id, _ := v.(string)
	return id
}
