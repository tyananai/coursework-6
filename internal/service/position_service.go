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

// PositionService defines business operations on positions.
type PositionService interface {
	CreatePosition(ctx context.Context, req CreatePositionRequest) (*models.Position, error)
	GetPosition(ctx context.Context, id uuid.UUID) (*models.Position, error)
	UpdatePosition(ctx context.Context, accountID uuid.UUID, id uuid.UUID, req UpdatePositionRequest) (*models.Position, error)
	DeletePosition(ctx context.Context, accountID uuid.UUID, id uuid.UUID) error
	ListPositions(ctx context.Context, userID uuid.UUID) ([]*models.Position, error)
}

type positionService struct {
	positions repository.PositionRepository
	users     repository.UserRepository
	validate  *validator.Validate
}

// NewPositionService creates a new PositionService.
func NewPositionService(positions repository.PositionRepository, users repository.UserRepository) PositionService {
	return &positionService{
		positions: positions,
		users:     users,
		validate:  validator.New(),
	}
}

func (s *positionService) CreatePosition(ctx context.Context, req CreatePositionRequest) (*models.Position, error) {
	if err := s.validate.Struct(req); err != nil {
		return nil, fmt.Errorf("%w: %s", apperrors.ErrValidation, err.Error())
	}
	if _, err := s.users.GetByID(ctx, req.UserID); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("positionService.CreatePosition: %w", err)
	}
	pos := &models.Position{
		UserID:       req.UserID,
		JobTitle:     req.JobTitle,
		Organization: req.Organization,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		IsCurrent:    req.IsCurrent,
	}
	if err := s.positions.Create(ctx, pos); err != nil {
		return nil, fmt.Errorf("positionService.CreatePosition: %w", err)
	}
	return pos, nil
}

func (s *positionService) GetPosition(ctx context.Context, id uuid.UUID) (*models.Position, error) {
	pos, err := s.positions.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("positionService.GetPosition: %w", err)
	}
	return pos, nil
}

func (s *positionService) UpdatePosition(ctx context.Context, accountID uuid.UUID, id uuid.UUID, req UpdatePositionRequest) (*models.Position, error) {
	if err := s.validate.Struct(req); err != nil {
		return nil, fmt.Errorf("%w: %s", apperrors.ErrValidation, err.Error())
	}
	pos, err := s.positions.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("positionService.UpdatePosition: %w", err)
	}
	if err = s.checkOwner(ctx, pos.UserID, accountID); err != nil {
		return nil, err
	}
	pos.JobTitle = req.JobTitle
	pos.Organization = req.Organization
	pos.StartDate = req.StartDate
	pos.EndDate = req.EndDate
	pos.IsCurrent = req.IsCurrent
	if err = s.positions.Update(ctx, pos); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("positionService.UpdatePosition: %w", err)
	}
	return pos, nil
}

func (s *positionService) DeletePosition(ctx context.Context, accountID uuid.UUID, id uuid.UUID) error {
	pos, err := s.positions.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return apperrors.ErrNotFound
		}
		return fmt.Errorf("positionService.DeletePosition: %w", err)
	}
	if err = s.checkOwner(ctx, pos.UserID, accountID); err != nil {
		return err
	}
	if err = s.positions.Delete(ctx, id); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return apperrors.ErrNotFound
		}
		return fmt.Errorf("positionService.DeletePosition: %w", err)
	}
	return nil
}

func (s *positionService) checkOwner(ctx context.Context, userID uuid.UUID, accountID uuid.UUID) error {
	u, err := s.users.GetByID(ctx, userID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return apperrors.ErrNotFound
		}
		return fmt.Errorf("positionService.checkOwner: %w", err)
	}
	if u.AccountID == nil || *u.AccountID != accountID {
		return apperrors.ErrUnauthorized
	}
	return nil
}

func (s *positionService) ListPositions(ctx context.Context, userID uuid.UUID) ([]*models.Position, error) {
	positions, err := s.positions.ListByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("positionService.ListPositions: %w", err)
	}
	return positions, nil
}
