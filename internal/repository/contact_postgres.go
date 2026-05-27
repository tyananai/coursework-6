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

type contactPostgres struct {
	db *pgxpool.Pool
}

// NewContactRepository creates a new PostgreSQL-backed ContactRepository.
func NewContactRepository(db *pgxpool.Pool) ContactRepository {
	return &contactPostgres{db: db}
}

func (r *contactPostgres) Create(ctx context.Context, c *models.Contact) error {
	const q = `
		INSERT INTO contacts (user_id, type, url)
		VALUES ($1, $2, $3)
		RETURNING id`

	err := r.db.QueryRow(ctx, q, c.UserID, c.Type, c.URL).Scan(&c.ID)
	if err != nil {
		return fmt.Errorf("ContactRepository.Create: %w", err)
	}
	return nil
}

func (r *contactPostgres) GetByID(ctx context.Context, id uuid.UUID) (*models.Contact, error) {
	const q = `
		SELECT id, user_id, type, url
		FROM contacts
		WHERE id = $1`

	c := &models.Contact{}
	err := r.db.QueryRow(ctx, q, id).Scan(&c.ID, &c.UserID, &c.Type, &c.URL)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("ContactRepository.GetByID: %w", apperrors.ErrNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("ContactRepository.GetByID: %w", err)
	}
	return c, nil
}

func (r *contactPostgres) Update(ctx context.Context, c *models.Contact) error {
	const q = `
		UPDATE contacts
		SET type = $1, url = $2
		WHERE id = $3`

	tag, err := r.db.Exec(ctx, q, c.Type, c.URL, c.ID)
	if err != nil {
		return fmt.Errorf("ContactRepository.Update: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("ContactRepository.Update: %w", apperrors.ErrNotFound)
	}
	return nil
}

func (r *contactPostgres) Delete(ctx context.Context, id uuid.UUID) error {
	const q = `DELETE FROM contacts WHERE id = $1`

	tag, err := r.db.Exec(ctx, q, id)
	if err != nil {
		return fmt.Errorf("ContactRepository.Delete: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("ContactRepository.Delete: %w", apperrors.ErrNotFound)
	}
	return nil
}

func (r *contactPostgres) ListByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Contact, error) {
	const q = `
		SELECT id, user_id, type, url
		FROM contacts
		WHERE user_id = $1
		ORDER BY type`

	rows, err := r.db.Query(ctx, q, userID)
	if err != nil {
		return nil, fmt.Errorf("ContactRepository.ListByUserID: %w", err)
	}
	defer rows.Close()

	var contacts []*models.Contact
	for rows.Next() {
		c := &models.Contact{}
		err = rows.Scan(&c.ID, &c.UserID, &c.Type, &c.URL)
		if err != nil {
			return nil, fmt.Errorf("ContactRepository.ListByUserID: %w", err)
		}
		contacts = append(contacts, c)
	}
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("ContactRepository.ListByUserID: %w", err)
	}
	return contacts, nil
}
