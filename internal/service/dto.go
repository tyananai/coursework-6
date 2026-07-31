package service

import (
	"time"

	"github.com/google/uuid"

	"resume/internal/models"
)

// UserFilter holds optional filters for listing users.
type UserFilter struct {
	AccountID  *uuid.UUID
	RegionID   *uuid.UUID
	IndustryID *uuid.UUID
}

// CreateUserRequest is the input for creating a user.
type CreateUserRequest struct {
	FirstName  *string    `json:"first_name"  validate:"omitempty,min=1,max=100"`
	LastName   *string    `json:"last_name"   validate:"omitempty,min=1,max=100"`
	Summary    *string    `json:"summary"     validate:"omitempty,max=2000"`
	PhotoURL   *string    `json:"photo_url"   validate:"omitempty,url"`
	RegionID   *uuid.UUID `json:"region_id"`
	IndustryID *uuid.UUID `json:"industry_id"`
}

// UpdateUserRequest is the input for updating a user.
type UpdateUserRequest struct {
	FirstName  *string    `json:"first_name"  validate:"omitempty,min=1,max=100"`
	LastName   *string    `json:"last_name"   validate:"omitempty,min=1,max=100"`
	Summary    *string    `json:"summary"     validate:"omitempty,max=2000"`
	PhotoURL   *string    `json:"photo_url"   validate:"omitempty,url"`
	RegionID   *uuid.UUID `json:"region_id"`
	IndustryID *uuid.UUID `json:"industry_id"`
}

// UserResponse is the rich aggregate view of a user including all related entities.
type UserResponse struct {
	ID         uuid.UUID           `json:"id"`
	FirstName  *string             `json:"first_name,omitempty"`
	LastName   *string             `json:"last_name,omitempty"`
	Summary    *string             `json:"summary,omitempty"`
	PhotoURL   *string             `json:"photo_url,omitempty"`
	RegionID   *uuid.UUID          `json:"region_id,omitempty"`
	IndustryID *uuid.UUID          `json:"industry_id,omitempty"`
	CreatedAt  time.Time           `json:"created_at"`
	UpdatedAt  time.Time           `json:"updated_at"`
	Positions  []*models.Position  `json:"positions,omitempty"`
	Education  []*models.Education `json:"education,omitempty"`
	Contacts   []*models.Contact   `json:"contacts,omitempty"`
	Skills     []*models.Skill     `json:"skills,omitempty"`
}

// RegisterRequest is the input for the auth register endpoint.
type RegisterRequest struct {
	Email    string `json:"email"    validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=8,max=72"`
}

// LoginRequest is the input for the auth login endpoint.
type LoginRequest struct {
	Email    string `json:"email"    validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// CreatePositionRequest is the input for creating a position.
type CreatePositionRequest struct {
	UserID       uuid.UUID  `json:"user_id"      validate:"required"`
	JobTitle     *string    `json:"job_title"    validate:"omitempty,min=1,max=200"`
	Organization *string    `json:"organization" validate:"omitempty,min=1,max=200"`
	StartDate    *time.Time `json:"start_date"`
	EndDate      *time.Time `json:"end_date"`
	IsCurrent    bool       `json:"is_current"`
}

// UpdatePositionRequest is the input for updating a position.
type UpdatePositionRequest struct {
	JobTitle     *string    `json:"job_title"    validate:"omitempty,min=1,max=200"`
	Organization *string    `json:"organization" validate:"omitempty,min=1,max=200"`
	StartDate    *time.Time `json:"start_date"`
	EndDate      *time.Time `json:"end_date"`
	IsCurrent    bool       `json:"is_current"`
}

// CreateEducationRequest is the input for creating an education record.
type CreateEducationRequest struct {
	UserID     uuid.UUID  `json:"user_id"     validate:"required"`
	SchoolName *string    `json:"school_name" validate:"omitempty,min=1,max=200"`
	StartDate  *time.Time `json:"start_date"`
	EndDate    *time.Time `json:"end_date"`
}

// UpdateEducationRequest is the input for updating an education record.
type UpdateEducationRequest struct {
	SchoolName *string    `json:"school_name" validate:"omitempty,min=1,max=200"`
	StartDate  *time.Time `json:"start_date"`
	EndDate    *time.Time `json:"end_date"`
}

// CreateContactRequest is the input for creating a contact.
type CreateContactRequest struct {
	UserID uuid.UUID `json:"user_id" validate:"required"`
	Type   string    `json:"type"    validate:"required,oneof=blog twitter linkedin github email website"`
	URL    *string   `json:"url"     validate:"omitempty"`
}

// UpdateContactRequest is the input for updating a contact.
type UpdateContactRequest struct {
	Type string  `json:"type" validate:"required,oneof=blog twitter linkedin github email website"`
	URL  *string `json:"url"  validate:"omitempty"`
}

// CreateSkillRequest is the input for creating a skill.
type CreateSkillRequest struct {
	UserID    uuid.UUID `json:"user_id"    validate:"required"`
	Name      string    `json:"name"       validate:"required,min=1,max=100"`
	Category  *string   `json:"category"   validate:"omitempty,min=1,max=100"`
	SortOrder int       `json:"sort_order" validate:"min=0"`
}

// UpdateSkillRequest is the input for updating a skill.
type UpdateSkillRequest struct {
	Name      string  `json:"name"       validate:"required,min=1,max=100"`
	Category  *string `json:"category"   validate:"omitempty,min=1,max=100"`
	SortOrder int     `json:"sort_order" validate:"min=0"`
}
