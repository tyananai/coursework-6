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

// ContactService defines business operations on contacts.
type ContactService interface {
	CreateContact(ctx context.Context, req CreateContactRequest) (*models.Contact, error)
	GetContact(ctx context.Context, id uuid.UUID) (*models.Contact, error)
	UpdateContact(ctx context.Context, accountID uuid.UUID, id uuid.UUID, req UpdateContactRequest) (*models.Contact, error)
	DeleteContact(ctx context.Context, accountID uuid.UUID, id uuid.UUID) error
	ListContacts(ctx context.Context, userID uuid.UUID) ([]*models.Contact, error)
}

type contactService struct {
	contacts repository.ContactRepository
	users    repository.UserRepository
	validate *validator.Validate
}

// NewContactService creates a new ContactService.
func NewContactService(contacts repository.ContactRepository, users repository.UserRepository) ContactService {
	return &contactService{
		contacts: contacts,
		users:    users,
		validate: validator.New(),
	}
}

func (s *contactService) CreateContact(ctx context.Context, req CreateContactRequest) (*models.Contact, error) {
	if err := s.validate.Struct(req); err != nil {
		return nil, fmt.Errorf("%w: %s", apperrors.ErrValidation, err.Error())
	}
	if _, err := s.users.GetByID(ctx, req.UserID); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("contactService.CreateContact: %w", err)
	}
	c := &models.Contact{
		UserID: req.UserID,
		Type:   req.Type,
		URL:    req.URL,
	}
	if err := s.contacts.Create(ctx, c); err != nil {
		return nil, fmt.Errorf("contactService.CreateContact: %w", err)
	}
	return c, nil
}

func (s *contactService) GetContact(ctx context.Context, id uuid.UUID) (*models.Contact, error) {
	c, err := s.contacts.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("contactService.GetContact: %w", err)
	}
	return c, nil
}

func (s *contactService) UpdateContact(ctx context.Context, accountID uuid.UUID, id uuid.UUID, req UpdateContactRequest) (*models.Contact, error) {
	if err := s.validate.Struct(req); err != nil {
		return nil, fmt.Errorf("%w: %s", apperrors.ErrValidation, err.Error())
	}
	c, err := s.contacts.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("contactService.UpdateContact: %w", err)
	}
	if err = s.checkOwner(ctx, c.UserID, accountID); err != nil {
		return nil, err
	}
	c.Type = req.Type
	c.URL = req.URL
	if err = s.contacts.Update(ctx, c); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("contactService.UpdateContact: %w", err)
	}
	return c, nil
}

func (s *contactService) DeleteContact(ctx context.Context, accountID uuid.UUID, id uuid.UUID) error {
	c, err := s.contacts.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return apperrors.ErrNotFound
		}
		return fmt.Errorf("contactService.DeleteContact: %w", err)
	}
	if err = s.checkOwner(ctx, c.UserID, accountID); err != nil {
		return err
	}
	if err = s.contacts.Delete(ctx, id); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return apperrors.ErrNotFound
		}
		return fmt.Errorf("contactService.DeleteContact: %w", err)
	}
	return nil
}

func (s *contactService) checkOwner(ctx context.Context, userID uuid.UUID, accountID uuid.UUID) error {
	u, err := s.users.GetByID(ctx, userID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return apperrors.ErrNotFound
		}
		return fmt.Errorf("contactService.checkOwner: %w", err)
	}
	if u.AccountID == nil || *u.AccountID != accountID {
		return apperrors.ErrUnauthorized
	}
	return nil
}

func (s *contactService) ListContacts(ctx context.Context, userID uuid.UUID) ([]*models.Contact, error) {
	contacts, err := s.contacts.ListByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("contactService.ListContacts: %w", err)
	}
	return contacts, nil
}
