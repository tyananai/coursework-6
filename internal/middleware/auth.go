package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/google/uuid"

	"resume/internal/apperrors"
	"resume/internal/auth"
	"resume/internal/render"
)

type accountIDKey struct{}

// NewAuth returns a middleware that validates a Bearer JWT and stores
// the parsed account ID in the request context.
func NewAuth(tokens *auth.TokenService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if !strings.HasPrefix(header, "Bearer ") {
				render.Error(w, apperrors.ErrUnauthorized)
				return
			}
			tokenStr := strings.TrimPrefix(header, "Bearer ")
			claims, err := tokens.Parse(tokenStr)
			if err != nil {
				render.Error(w, apperrors.ErrUnauthorized)
				return
			}
			ctx := context.WithValue(r.Context(), accountIDKey{}, claims.AccountID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetAccountID retrieves the authenticated account's UUID from the context.
func GetAccountID(ctx context.Context) (uuid.UUID, bool) {
	id, ok := ctx.Value(accountIDKey{}).(uuid.UUID)
	return id, ok
}
