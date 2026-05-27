package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"

	"resume/internal/apperrors"
	"resume/internal/models"
	"resume/internal/repository"
)

// SkillService defines business operations on skills.
type SkillService interface {
	CreateSkill(ctx context.Context, req CreateSkillRequest) (*models.Skill, error)
	GetSkill(ctx context.Context, id uuid.UUID) (*models.Skill, error)
	UpdateSkill(ctx context.Context, id uuid.UUID, req UpdateSkillRequest) (*models.Skill, error)
	DeleteSkill(ctx context.Context, id uuid.UUID) error
	ListSkills(ctx context.Context, userID uuid.UUID) ([]*models.Skill, error)
}

type skillService struct {
	skills   repository.SkillRepository
	users    repository.UserRepository
	validate *validator.Validate
}

// NewSkillService creates a new SkillService.
func NewSkillService(skills repository.SkillRepository, users repository.UserRepository) SkillService {
	return &skillService{
		skills:   skills,
		users:    users,
		validate: validator.New(),
	}
}

func (s *skillService) CreateSkill(ctx context.Context, req CreateSkillRequest) (*models.Skill, error) {
	if err := s.validate.Struct(req); err != nil {
		return nil, fmt.Errorf("%w: %s", apperrors.ErrValidation, err.Error())
	}
	if _, err := s.users.GetByID(ctx, req.UserID); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("skillService.CreateSkill: %w", err)
	}
	sk := &models.Skill{
		UserID:    req.UserID,
		Name:      req.Name,
		Category:  req.Category,
		SortOrder: req.SortOrder,
	}
	if err := s.skills.Create(ctx, sk); err != nil {
		return nil, fmt.Errorf("skillService.CreateSkill: %w", err)
	}
	return sk, nil
}

func (s *skillService) GetSkill(ctx context.Context, id uuid.UUID) (*models.Skill, error) {
	sk, err := s.skills.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("skillService.GetSkill: %w", err)
	}
	return sk, nil
}

func (s *skillService) UpdateSkill(ctx context.Context, id uuid.UUID, req UpdateSkillRequest) (*models.Skill, error) {
	if err := s.validate.Struct(req); err != nil {
		return nil, fmt.Errorf("%w: %s", apperrors.ErrValidation, err.Error())
	}
	sk, err := s.skills.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("skillService.UpdateSkill: %w", err)
	}
	sk.Name = req.Name
	sk.Category = req.Category
	sk.SortOrder = req.SortOrder
	if err = s.skills.Update(ctx, sk); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("skillService.UpdateSkill: %w", err)
	}
	return sk, nil
}

func (s *skillService) DeleteSkill(ctx context.Context, id uuid.UUID) error {
	err := s.skills.Delete(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return apperrors.ErrNotFound
		}
		return fmt.Errorf("skillService.DeleteSkill: %w", err)
	}
	return nil
}

func (s *skillService) ListSkills(ctx context.Context, userID uuid.UUID) ([]*models.Skill, error) {
	skills, err := s.skills.ListByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("skillService.ListSkills: %w", err)
	}
	return skills, nil
}
