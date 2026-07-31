// Package repository provides data access interfaces and PostgreSQL implementations.
package repository

import (
	"context"

	"github.com/google/uuid"

	"resume/internal/models"
)

// UserFilter holds optional filters for listing users.
type UserFilter struct {
	AccountID  *uuid.UUID
	RegionID   *uuid.UUID
	IndustryID *uuid.UUID
}

// UserRepository defines data access operations for users (resumes).
type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id uuid.UUID) error
	List(ctx context.Context, filter UserFilter) ([]*models.User, error)
}

// AccountRepository defines data access operations for auth accounts.
type AccountRepository interface {
	Create(ctx context.Context, account *models.Account) error
	GetByEmail(ctx context.Context, email string) (*models.Account, error)
}

// PositionRepository defines data access operations for positions.
type PositionRepository interface {
	Create(ctx context.Context, pos *models.Position) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Position, error)
	Update(ctx context.Context, pos *models.Position) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Position, error)
}

// EducationRepository defines data access operations for education records.
type EducationRepository interface {
	Create(ctx context.Context, edu *models.Education) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Education, error)
	Update(ctx context.Context, edu *models.Education) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Education, error)
}

// ContactRepository defines data access operations for contacts.
type ContactRepository interface {
	Create(ctx context.Context, c *models.Contact) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Contact, error)
	Update(ctx context.Context, c *models.Contact) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Contact, error)
}

// SkillRepository defines data access operations for skills.
type SkillRepository interface {
	Create(ctx context.Context, s *models.Skill) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Skill, error)
	Update(ctx context.Context, s *models.Skill) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Skill, error)
}

// RegionRepository defines data access operations for regions.
type RegionRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Region, error)
	List(ctx context.Context) ([]*models.Region, error)
}

// IndustryRepository defines data access operations for industries.
type IndustryRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Industry, error)
	List(ctx context.Context) ([]*models.Industry, error)
}
