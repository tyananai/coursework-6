package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"resume/internal/apperrors"
	"resume/internal/models"
)

type userPostgres struct {
	db *pgxpool.Pool
}

// NewUserRepository creates a new PostgreSQL-backed UserRepository.
func NewUserRepository(db *pgxpool.Pool) UserRepository {
	return &userPostgres{db: db}
}

func (r *userPostgres) Create(ctx context.Context, user *models.User) error {
	const q = `
		INSERT INTO users (account_id, first_name, last_name, summary, photo_url, region_id, industry_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRow(ctx, q,
		user.AccountID,
		user.FirstName, user.LastName, user.Summary,
		user.PhotoURL, user.RegionID, user.IndustryID,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return fmt.Errorf("UserRepository.Create: %w", err)
	}
	return nil
}

func (r *userPostgres) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	const q = `
		SELECT id, account_id, first_name, last_name, summary, photo_url,
		       region_id, industry_id, created_at, updated_at
		FROM users
		WHERE id = $1`

	u := &models.User{}
	err := r.db.QueryRow(ctx, q, id).Scan(
		&u.ID, &u.AccountID,
		&u.FirstName, &u.LastName, &u.Summary, &u.PhotoURL,
		&u.RegionID, &u.IndustryID, &u.CreatedAt, &u.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("UserRepository.GetByID: %w", apperrors.ErrNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("UserRepository.GetByID: %w", err)
	}
	return u, nil
}

func (r *userPostgres) Update(ctx context.Context, user *models.User) error {
	const q = `
		UPDATE users
		SET first_name = $1, last_name = $2, summary = $3,
		    photo_url = $4, region_id = $5, industry_id = $6
		WHERE id = $7
		RETURNING updated_at`

	err := r.db.QueryRow(ctx, q,
		user.FirstName, user.LastName, user.Summary,
		user.PhotoURL, user.RegionID, user.IndustryID, user.ID,
	).Scan(&user.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return fmt.Errorf("UserRepository.Update: %w", apperrors.ErrNotFound)
	}
	if err != nil {
		return fmt.Errorf("UserRepository.Update: %w", err)
	}
	return nil
}

func (r *userPostgres) Delete(ctx context.Context, id uuid.UUID) error {
	const q = `DELETE FROM users WHERE id = $1`

	tag, err := r.db.Exec(ctx, q, id)
	if err != nil {
		return fmt.Errorf("UserRepository.Delete: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("UserRepository.Delete: %w", apperrors.ErrNotFound)
	}
	return nil
}

func (r *userPostgres) List(ctx context.Context, filter UserFilter) ([]*models.User, error) {
	q := `
		SELECT id, account_id, first_name, last_name, summary, photo_url,
		       region_id, industry_id, created_at, updated_at
		FROM users
		WHERE true`

	const maxFilters = 3
	args := make([]any, 0, maxFilters)
	i := 1

	if filter.AccountID != nil {
		q += fmt.Sprintf(" AND account_id = $%d", i)
		args = append(args, *filter.AccountID)
		i++
	}
	if filter.RegionID != nil {
		q += fmt.Sprintf(" AND region_id = $%d", i)
		args = append(args, *filter.RegionID)
		i++
	}
	if filter.IndustryID != nil {
		q += fmt.Sprintf(" AND industry_id = $%d", i)
		args = append(args, *filter.IndustryID)
		i++
	}
	_ = i

	rows, err := r.db.Query(ctx, q, args...)
	if err != nil {
		return nil, fmt.Errorf("UserRepository.List: %w", err)
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		u := &models.User{}
		err = rows.Scan(
			&u.ID, &u.AccountID,
			&u.FirstName, &u.LastName, &u.Summary, &u.PhotoURL,
			&u.RegionID, &u.IndustryID, &u.CreatedAt, &u.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("UserRepository.List: %w", err)
		}
		users = append(users, u)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("UserRepository.List: %w", err)
	}
	return users, nil
}
