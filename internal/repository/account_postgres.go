package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"resume/internal/apperrors"
	"resume/internal/models"
)

type accountPostgres struct {
	db *pgxpool.Pool
}

// NewAccountRepository creates a new PostgreSQL-backed AccountRepository.
func NewAccountRepository(db *pgxpool.Pool) AccountRepository {
	return &accountPostgres{db: db}
}

func (r *accountPostgres) Create(ctx context.Context, account *models.Account) error {
	const q = `
		INSERT INTO accounts (email, password_hash)
		VALUES ($1, $2)
		RETURNING id, created_at`

	err := r.db.QueryRow(ctx, q, account.Email, account.PasswordHash).
		Scan(&account.ID, &account.CreatedAt)
	if err != nil {
		return fmt.Errorf("AccountRepository.Create: %w", err)
	}
	return nil
}

func (r *accountPostgres) GetByEmail(ctx context.Context, email string) (*models.Account, error) {
	const q = `
		SELECT id, email, password_hash, created_at
		FROM accounts
		WHERE email = $1`

	a := &models.Account{}
	err := r.db.QueryRow(ctx, q, email).Scan(&a.ID, &a.Email, &a.PasswordHash, &a.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("AccountRepository.GetByEmail: %w", apperrors.ErrNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("AccountRepository.GetByEmail: %w", err)
	}
	return a, nil
}
