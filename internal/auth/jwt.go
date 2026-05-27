// Package auth provides JWT token generation and validation.
package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"resume/internal/apperrors"
)

const tokenTTL = 24 * time.Hour

// Claims carries the account_id inside the JWT.
type Claims struct {
	AccountID uuid.UUID `json:"account_id"`
	jwt.RegisteredClaims
}

// TokenService signs and validates JWTs.
type TokenService struct {
	secret []byte
}

// NewTokenService creates a TokenService using the given HMAC secret.
func NewTokenService(secret string) *TokenService {
	return &TokenService{secret: []byte(secret)}
}

// Generate creates a signed JWT for the given account ID, valid for 24 hours.
func (s *TokenService) Generate(accountID uuid.UUID) (string, error) {
	now := time.Now()
	claims := Claims{
		AccountID: accountID,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(tokenTTL)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.secret)
	if err != nil {
		return "", fmt.Errorf("auth.Generate: %w", err)
	}
	return signed, nil
}

// Parse validates a token string and returns the embedded claims.
// Returns ErrUnauthorized on any failure (expired, tampered, wrong algorithm).
func (s *TokenService) Parse(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.secret, nil
	})
	if err != nil || !token.Valid {
		return nil, apperrors.ErrUnauthorized
	}
	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, apperrors.ErrUnauthorized
	}
	return claims, nil
}
