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

type educationPostgres struct {
	db *pgxpool.Pool
}

// NewEducationRepository creates a new PostgreSQL-backed EducationRepository.
func NewEducationRepository(db *pgxpool.Pool) EducationRepository {
	return &educationPostgres{db: db}
}

func (r *educationPostgres) Create(ctx context.Context, edu *models.Education) error {
	const q = `
		INSERT INTO education (user_id, school_name, start_date, end_date)
		VALUES ($1, $2, $3, $4)
		RETURNING id`

	err := r.db.QueryRow(ctx, q,
		edu.UserID, edu.SchoolName, edu.StartDate, edu.EndDate,
	).Scan(&edu.ID)
	if err != nil {
		return fmt.Errorf("EducationRepository.Create: %w", err)
	}
	return nil
}

func (r *educationPostgres) GetByID(ctx context.Context, id uuid.UUID) (*models.Education, error) {
	const q = `
		SELECT id, user_id, school_name, start_date, end_date
		FROM education
		WHERE id = $1`

	e := &models.Education{}
	err := r.db.QueryRow(ctx, q, id).Scan(
		&e.ID, &e.UserID, &e.SchoolName, &e.StartDate, &e.EndDate,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("EducationRepository.GetByID: %w", apperrors.ErrNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("EducationRepository.GetByID: %w", err)
	}
	return e, nil
}

func (r *educationPostgres) Update(ctx context.Context, edu *models.Education) error {
	const q = `
		UPDATE education
		SET school_name = $1, start_date = $2, end_date = $3
		WHERE id = $4`

	tag, err := r.db.Exec(ctx, q,
		edu.SchoolName, edu.StartDate, edu.EndDate, edu.ID,
	)
	if err != nil {
		return fmt.Errorf("EducationRepository.Update: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("EducationRepository.Update: %w", apperrors.ErrNotFound)
	}
	return nil
}

func (r *educationPostgres) Delete(ctx context.Context, id uuid.UUID) error {
	const q = `DELETE FROM education WHERE id = $1`

	tag, err := r.db.Exec(ctx, q, id)
	if err != nil {
		return fmt.Errorf("EducationRepository.Delete: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("EducationRepository.Delete: %w", apperrors.ErrNotFound)
	}
	return nil
}

func (r *educationPostgres) ListByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Education, error) {
	const q = `
		SELECT id, user_id, school_name, start_date, end_date
		FROM education
		WHERE user_id = $1
		ORDER BY start_date DESC`

	rows, err := r.db.Query(ctx, q, userID)
	if err != nil {
		return nil, fmt.Errorf("EducationRepository.ListByUserID: %w", err)
	}
	defer rows.Close()

	var records []*models.Education
	for rows.Next() {
		e := &models.Education{}
		err = rows.Scan(
			&e.ID, &e.UserID, &e.SchoolName, &e.StartDate, &e.EndDate,
		)
		if err != nil {
			return nil, fmt.Errorf("EducationRepository.ListByUserID: %w", err)
		}
		records = append(records, e)
	}
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("EducationRepository.ListByUserID: %w", err)
	}
	return records, nil
}
