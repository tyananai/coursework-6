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

type regionPostgres struct {
	db *pgxpool.Pool
}

// NewRegionRepository creates a new PostgreSQL-backed RegionRepository.
func NewRegionRepository(db *pgxpool.Pool) RegionRepository {
	return &regionPostgres{db: db}
}

func (r *regionPostgres) GetByID(ctx context.Context, id uuid.UUID) (*models.Region, error) {
	const q = `SELECT id, name FROM regions WHERE id = $1`

	reg := &models.Region{}
	err := r.db.QueryRow(ctx, q, id).Scan(&reg.ID, &reg.Name)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("RegionRepository.GetByID: %w", apperrors.ErrNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("RegionRepository.GetByID: %w", err)
	}
	return reg, nil
}

func (r *regionPostgres) List(ctx context.Context) ([]*models.Region, error) {
	const q = `SELECT id, name FROM regions ORDER BY name`

	rows, err := r.db.Query(ctx, q)
	if err != nil {
		return nil, fmt.Errorf("RegionRepository.List: %w", err)
	}
	defer rows.Close()

	var regions []*models.Region
	for rows.Next() {
		reg := &models.Region{}
		err = rows.Scan(&reg.ID, &reg.Name)
		if err != nil {
			return nil, fmt.Errorf("RegionRepository.List: %w", err)
		}
		regions = append(regions, reg)
	}
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("RegionRepository.List: %w", err)
	}
	return regions, nil
}
