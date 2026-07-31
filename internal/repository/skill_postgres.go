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

type skillPostgres struct {
	db *pgxpool.Pool
}

// NewSkillRepository creates a new PostgreSQL-backed SkillRepository.
func NewSkillRepository(db *pgxpool.Pool) SkillRepository {
	return &skillPostgres{db: db}
}

func (r *skillPostgres) Create(ctx context.Context, s *models.Skill) error {
	const q = `
		INSERT INTO skills (user_id, name, category, sort_order)
		VALUES ($1, $2, $3, $4)
		RETURNING id`

	err := r.db.QueryRow(ctx, q,
		s.UserID, s.Name, s.Category, s.SortOrder,
	).Scan(&s.ID)
	if err != nil {
		return fmt.Errorf("SkillRepository.Create: %w", err)
	}
	return nil
}

func (r *skillPostgres) GetByID(ctx context.Context, id uuid.UUID) (*models.Skill, error) {
	const q = `
		SELECT id, user_id, name, category, sort_order
		FROM skills
		WHERE id = $1`

	s := &models.Skill{}
	err := r.db.QueryRow(ctx, q, id).Scan(
		&s.ID, &s.UserID, &s.Name, &s.Category, &s.SortOrder,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("SkillRepository.GetByID: %w", apperrors.ErrNotFound)
	}
	if err != nil {
		return nil, fmt.Errorf("SkillRepository.GetByID: %w", err)
	}
	return s, nil
}

func (r *skillPostgres) Update(ctx context.Context, s *models.Skill) error {
	const q = `
		UPDATE skills
		SET name = $1, category = $2, sort_order = $3
		WHERE id = $4`

	tag, err := r.db.Exec(ctx, q, s.Name, s.Category, s.SortOrder, s.ID)
	if err != nil {
		return fmt.Errorf("SkillRepository.Update: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("SkillRepository.Update: %w", apperrors.ErrNotFound)
	}
	return nil
}

func (r *skillPostgres) Delete(ctx context.Context, id uuid.UUID) error {
	const q = `DELETE FROM skills WHERE id = $1`

	tag, err := r.db.Exec(ctx, q, id)
	if err != nil {
		return fmt.Errorf("SkillRepository.Delete: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("SkillRepository.Delete: %w", apperrors.ErrNotFound)
	}
	return nil
}

func (r *skillPostgres) ListByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Skill, error) {
	const q = `
		SELECT id, user_id, name, category, sort_order
		FROM skills
		WHERE user_id = $1
		ORDER BY sort_order`

	rows, err := r.db.Query(ctx, q, userID)
	if err != nil {
		return nil, fmt.Errorf("SkillRepository.ListByUserID: %w", err)
	}
	defer rows.Close()

	var skills []*models.Skill
	for rows.Next() {
		s := &models.Skill{}
		err = rows.Scan(
			&s.ID, &s.UserID, &s.Name, &s.Category, &s.SortOrder,
		)
		if err != nil {
			return nil, fmt.Errorf("SkillRepository.ListByUserID: %w", err)
		}
		skills = append(skills, s)
	}
	err = rows.Err()
	if err != nil {
		return nil, fmt.Errorf("SkillRepository.ListByUserID: %w", err)
	}
	return skills, nil
}
