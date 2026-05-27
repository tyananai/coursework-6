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

type industryPostgres struct {
	db *pgxpool.Pool
}

// NewIndustryRepository creates a new PostgreSQL-backed IndustryRepository.
func NewIndustryRepository(db *pgxpool.Pool) IndustryRepository {
	return &industryPostgres{db: db}
}

func (r *industryPostgres) GetByID(ctx context.Context, id uuid.UUID) (*models.Industry, error) {
	const q = `SELECT id, name FROM industries WHERE id = $1`

	ind := &models.Industry{}
	err := r.db.QueryRow(ctx, q, id).Scan(&ind.ID, &ind.Name)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("IndustryRepository.GetByID: %w", apperrors.ErrNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("IndustryRepository.GetByID: %w", err)
	}
	return ind, nil
}

func (r *industryPostgres) List(ctx context.Context) ([]*models.Industry, error) {
	const q = `SELECT id, name FROM industries ORDER BY name`

	rows, err := r.db.Query(ctx, q)
	if err != nil {
		return nil, fmt.Errorf("IndustryRepository.List: %w", err)
	}
	defer rows.Close()

	var industries []*models.Industry
	for rows.Next() {
		ind := &models.Industry{}
		err = rows.Scan(&ind.ID, &ind.Name)
		if err != nil {
			return nil, fmt.Errorf("IndustryRepository.List: %w", err)
		}
		industries = append(industries, ind)
	}
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("IndustryRepository.List: %w", err)
	}
	return industries, nil
}
