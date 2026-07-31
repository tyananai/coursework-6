package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"

	"resume/internal/apperrors"
	"resume/internal/auth"
	"resume/internal/models"
	"resume/internal/repository"
)

const bcryptCost = bcrypt.DefaultCost

// AuthService handles account registration and login.
type AuthService interface {
	Register(ctx context.Context, req RegisterRequest) (string, error)
	Login(ctx context.Context, req LoginRequest) (string, error)
}

type authService struct {
	accounts repository.AccountRepository
	tokens   *auth.TokenService
	validate *validator.Validate
}

// NewAuthService creates a new AuthService.
func NewAuthService(accounts repository.AccountRepository, tokens *auth.TokenService) AuthService {
	return &authService{accounts: accounts, tokens: tokens, validate: validator.New()}
}

func (s *authService) Register(ctx context.Context, req RegisterRequest) (string, error) {
	if err := s.validate.Struct(req); err != nil {
		return "", fmt.Errorf("%w: %s", apperrors.ErrValidation, err.Error())
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcryptCost)
	if err != nil {
		return "", fmt.Errorf("authService.Register: %w", err)
	}
	a := &models.Account{
		Email:        req.Email,
		PasswordHash: string(hash),
	}
	if err = s.accounts.Create(ctx, a); err != nil {
		if isUniqueViolation(err) {
			return "", fmt.Errorf("%w: email already registered", apperrors.ErrConflict)
		}
		return "", fmt.Errorf("authService.Register: %w", err)
	}
	token, err := s.tokens.Generate(a.ID)
	if err != nil {
		return "", fmt.Errorf("authService.Register: %w", err)
	}
	return token, nil
}

func (s *authService) Login(ctx context.Context, req LoginRequest) (string, error) {
	if err := s.validate.Struct(req); err != nil {
		return "", fmt.Errorf("%w: %s", apperrors.ErrValidation, err.Error())
	}
	a, err := s.accounts.GetByEmail(ctx, req.Email)
	if err != nil {
		return "", apperrors.ErrUnauthorized
	}
	if err = bcrypt.CompareHashAndPassword([]byte(a.PasswordHash), []byte(req.Password)); err != nil {
		return "", apperrors.ErrUnauthorized
	}
	token, err := s.tokens.Generate(a.ID)
	if err != nil {
		return "", fmt.Errorf("authService.Login: %w", err)
	}
	return token, nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
