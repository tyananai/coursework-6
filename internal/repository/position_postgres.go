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

type positionPostgres struct {
	db *pgxpool.Pool
}

// NewPositionRepository creates a new PostgreSQL-backed PositionRepository.
func NewPositionRepository(db *pgxpool.Pool) PositionRepository {
	return &positionPostgres{db: db}
}

func (r *positionPostgres) Create(ctx context.Context, pos *models.Position) error {
	const q = `
		INSERT INTO positions (user_id, job_title, organization, start_date, end_date, is_current)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id`

	err := r.db.QueryRow(ctx, q,
		pos.UserID, pos.JobTitle, pos.Organization,
		pos.StartDate, pos.EndDate, pos.IsCurrent,
	).Scan(&pos.ID)
	if err != nil {
		return fmt.Errorf("PositionRepository.Create: %w", err)
	}
	return nil
}

func (r *positionPostgres) GetByID(ctx context.Context, id uuid.UUID) (*models.Position, error) {
	const q = `
		SELECT id, user_id, job_title, organization, start_date, end_date, is_current
		FROM positions
		WHERE id = $1`

	p := &models.Position{}
	err := r.db.QueryRow(ctx, q, id).Scan(
		&p.ID, &p.UserID, &p.JobTitle, &p.Organization,
		&p.StartDate, &p.EndDate, &p.IsCurrent,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("PositionRepository.GetByID: %w", apperrors.ErrNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("PositionRepository.GetByID: %w", err)
	}
	return p, nil
}

func (r *positionPostgres) Update(ctx context.Context, pos *models.Position) error {
	const q = `
		UPDATE positions
		SET job_title = $1, organization = $2, start_date = $3,
		    end_date = $4, is_current = $5
		WHERE id = $6`

	tag, err := r.db.Exec(ctx, q,
		pos.JobTitle, pos.Organization, pos.StartDate,
		pos.EndDate, pos.IsCurrent, pos.ID,
	)
	if err != nil {
		return fmt.Errorf("PositionRepository.Update: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("PositionRepository.Update: %w", apperrors.ErrNotFound)
	}
	return nil
}

func (r *positionPostgres) Delete(ctx context.Context, id uuid.UUID) error {
	const q = `DELETE FROM positions WHERE id = $1`

	tag, err := r.db.Exec(ctx, q, id)
	if err != nil {
		return fmt.Errorf("PositionRepository.Delete: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("PositionRepository.Delete: %w", apperrors.ErrNotFound)
	}
	return nil
}

func (r *positionPostgres) ListByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Position, error) {
	const q = `
		SELECT id, user_id, job_title, organization, start_date, end_date, is_current
		FROM positions
		WHERE user_id = $1
		ORDER BY start_date DESC`

	rows, err := r.db.Query(ctx, q, userID)
	if err != nil {
		return nil, fmt.Errorf("PositionRepository.ListByUserID: %w", err)
	}
	defer rows.Close()

	var positions []*models.Position
	for rows.Next() {
		p := &models.Position{}
		err = rows.Scan(
			&p.ID, &p.UserID, &p.JobTitle, &p.Organization,
			&p.StartDate, &p.EndDate, &p.IsCurrent,
		)
		if err != nil {
			return nil, fmt.Errorf("PositionRepository.ListByUserID: %w", err)
		}
		positions = append(positions, p)
	}
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("PositionRepository.ListByUserID: %w", err)
	}
	return positions, nil
}
