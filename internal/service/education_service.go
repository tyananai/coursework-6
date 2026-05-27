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

// EducationService defines business operations on education records.
type EducationService interface {
	CreateEducation(ctx context.Context, req CreateEducationRequest) (*models.Education, error)
	GetEducation(ctx context.Context, id uuid.UUID) (*models.Education, error)
	UpdateEducation(ctx context.Context, id uuid.UUID, req UpdateEducationRequest) (*models.Education, error)
	DeleteEducation(ctx context.Context, id uuid.UUID) error
	ListEducation(ctx context.Context, userID uuid.UUID) ([]*models.Education, error)
}

type educationService struct {
	education repository.EducationRepository
	users     repository.UserRepository
	validate  *validator.Validate
}

// NewEducationService creates a new EducationService.
func NewEducationService(education repository.EducationRepository, users repository.UserRepository) EducationService {
	return &educationService{
		education: education,
		users:     users,
		validate:  validator.New(),
	}
}

func (s *educationService) CreateEducation(ctx context.Context, req CreateEducationRequest) (*models.Education, error) {
	if err := s.validate.Struct(req); err != nil {
		return nil, fmt.Errorf("%w: %s", apperrors.ErrValidation, err.Error())
	}
	if _, err := s.users.GetByID(ctx, req.UserID); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("educationService.CreateEducation: %w", err)
	}
	edu := &models.Education{
		UserID:     req.UserID,
		SchoolName: req.SchoolName,
		StartDate:  req.StartDate,
		EndDate:    req.EndDate,
	}
	if err := s.education.Create(ctx, edu); err != nil {
		return nil, fmt.Errorf("educationService.CreateEducation: %w", err)
	}
	return edu, nil
}

func (s *educationService) GetEducation(ctx context.Context, id uuid.UUID) (*models.Education, error) {
	edu, err := s.education.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("educationService.GetEducation: %w", err)
	}
	return edu, nil
}

func (s *educationService) UpdateEducation(ctx context.Context, id uuid.UUID, req UpdateEducationRequest) (*models.Education, error) {
	if err := s.validate.Struct(req); err != nil {
		return nil, fmt.Errorf("%w: %s", apperrors.ErrValidation, err.Error())
	}
	edu, err := s.education.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("educationService.UpdateEducation: %w", err)
	}
	edu.SchoolName = req.SchoolName
	edu.StartDate = req.StartDate
	edu.EndDate = req.EndDate
	if err = s.education.Update(ctx, edu); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("educationService.UpdateEducation: %w", err)
	}
	return edu, nil
}

func (s *educationService) DeleteEducation(ctx context.Context, id uuid.UUID) error {
	err := s.education.Delete(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return apperrors.ErrNotFound
		}
		return fmt.Errorf("educationService.DeleteEducation: %w", err)
	}
	return nil
}

func (s *educationService) ListEducation(ctx context.Context, userID uuid.UUID) ([]*models.Education, error) {
	education, err := s.education.ListByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("educationService.ListEducation: %w", err)
	}
	return education, nil
}
