package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"golang.org/x/sync/errgroup"

	"resume/internal/apperrors"
	"resume/internal/models"
	"resume/internal/repository"
)

// UserService defines business operations on users.
type UserService interface {
	CreateUser(ctx context.Context, accountID uuid.UUID, req CreateUserRequest) (*models.User, error)
	GetUser(ctx context.Context, id uuid.UUID) (*UserResponse, error)
	UpdateUser(ctx context.Context, id uuid.UUID, req UpdateUserRequest) (*models.User, error)
	UpdateUserPhoto(ctx context.Context, id uuid.UUID, photoURL string) (*models.User, error)
	DeleteUser(ctx context.Context, id uuid.UUID) error
	ListUsers(ctx context.Context, filter UserFilter) ([]*UserResponse, error)
}

type userService struct {
	users     repository.UserRepository
	positions repository.PositionRepository
	education repository.EducationRepository
	contacts  repository.ContactRepository
	skills    repository.SkillRepository
	validate  *validator.Validate
}

// NewUserService creates a new UserService.
func NewUserService(
	users repository.UserRepository,
	positions repository.PositionRepository,
	education repository.EducationRepository,
	contacts repository.ContactRepository,
	skills repository.SkillRepository,
) UserService {
	return &userService{
		users:     users,
		positions: positions,
		education: education,
		contacts:  contacts,
		skills:    skills,
		validate:  validator.New(),
	}
}

func (s *userService) CreateUser(ctx context.Context, accountID uuid.UUID, req CreateUserRequest) (*models.User, error) {
	if err := s.validate.Struct(req); err != nil {
		return nil, fmt.Errorf("%w: %s", apperrors.ErrValidation, err.Error())
	}
	u := &models.User{
		AccountID:  &accountID,
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		Summary:    req.Summary,
		PhotoURL:   req.PhotoURL,
		RegionID:   req.RegionID,
		IndustryID: req.IndustryID,
	}
	if err := s.users.Create(ctx, u); err != nil {
		return nil, fmt.Errorf("userService.CreateUser: %w", err)
	}
	return u, nil
}

func (s *userService) GetUser(ctx context.Context, id uuid.UUID) (*UserResponse, error) {
	u, err := s.users.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("userService.GetUser: %w", err)
	}
	return s.buildUserResponse(ctx, u)
}

func (s *userService) UpdateUser(ctx context.Context, id uuid.UUID, req UpdateUserRequest) (*models.User, error) {
	if err := s.validate.Struct(req); err != nil {
		return nil, fmt.Errorf("%w: %s", apperrors.ErrValidation, err.Error())
	}
	u, err := s.users.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("userService.UpdateUser: %w", err)
	}
	u.FirstName = req.FirstName
	u.LastName = req.LastName
	u.Summary = req.Summary
	u.PhotoURL = req.PhotoURL
	u.RegionID = req.RegionID
	u.IndustryID = req.IndustryID
	if err = s.users.Update(ctx, u); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("userService.UpdateUser: %w", err)
	}
	return u, nil
}

func (s *userService) UpdateUserPhoto(ctx context.Context, id uuid.UUID, photoURL string) (*models.User, error) {
	u, err := s.users.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("userService.UpdateUserPhoto: %w", err)
	}
	u.PhotoURL = &photoURL
	if err = s.users.Update(ctx, u); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("userService.UpdateUserPhoto: %w", err)
	}
	return u, nil
}

func (s *userService) DeleteUser(ctx context.Context, id uuid.UUID) error {
	err := s.users.Delete(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return apperrors.ErrNotFound
		}
		return fmt.Errorf("userService.DeleteUser: %w", err)
	}
	return nil
}

func (s *userService) ListUsers(ctx context.Context, filter UserFilter) ([]*UserResponse, error) {
	users, err := s.users.List(ctx, repository.UserFilter{
		AccountID:  filter.AccountID,
		RegionID:   filter.RegionID,
		IndustryID: filter.IndustryID,
	})
	if err != nil {
		return nil, fmt.Errorf("userService.ListUsers: %w", err)
	}
	responses := make([]*UserResponse, 0, len(users))
	for _, u := range users {
		resp, respErr := s.buildUserResponse(ctx, u)
		if respErr != nil {
			return nil, respErr
		}
		responses = append(responses, resp)
	}
	return responses, nil
}

func (s *userService) buildUserResponse(ctx context.Context, u *models.User) (*UserResponse, error) {
	g, gCtx := errgroup.WithContext(ctx)

	var positions []*models.Position
	var education []*models.Education
	var contacts []*models.Contact
	var skills []*models.Skill

	g.Go(func() error {
		var err error
		positions, err = s.positions.ListByUserID(gCtx, u.ID)
		return err
	})
	g.Go(func() error {
		var err error
		education, err = s.education.ListByUserID(gCtx, u.ID)
		return err
	})
	g.Go(func() error {
		var err error
		contacts, err = s.contacts.ListByUserID(gCtx, u.ID)
		return err
	})
	g.Go(func() error {
		var err error
		skills, err = s.skills.ListByUserID(gCtx, u.ID)
		return err
	})

	if err := g.Wait(); err != nil {
		return nil, fmt.Errorf("userService.buildUserResponse: %w", err)
	}

	return &UserResponse{
		ID:         u.ID,
		FirstName:  u.FirstName,
		LastName:   u.LastName,
		Summary:    u.Summary,
		PhotoURL:   u.PhotoURL,
		RegionID:   u.RegionID,
		IndustryID: u.IndustryID,
		CreatedAt:  u.CreatedAt,
		UpdatedAt:  u.UpdatedAt,
		Positions:  positions,
		Education:  education,
		Contacts:   contacts,
		Skills:     skills,
	}, nil
}
