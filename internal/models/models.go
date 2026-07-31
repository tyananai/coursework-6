// Package models contains shared domain types.
package models

import (
	"time"

	"github.com/google/uuid"
)

// Region is a geographic region associated with a user.
type Region struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

// Industry is a professional industry associated with a user.
type Industry struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

// Account holds authentication credentials, separate from resume data.
type Account struct {
	ID           uuid.UUID `json:"-"`
	Email        string    `json:"-"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"-"`
}

// User is the central domain entity representing a resume.
type User struct {
	ID         uuid.UUID  `json:"id"`
	AccountID  *uuid.UUID `json:"-"`
	FirstName  *string    `json:"first_name,omitempty"`
	LastName   *string    `json:"last_name,omitempty"`
	Summary    *string    `json:"summary,omitempty"`
	PhotoURL   *string    `json:"photo_url,omitempty"`
	RegionID   *uuid.UUID `json:"region_id,omitempty"`
	IndustryID *uuid.UUID `json:"industry_id,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

// Position is a work experience entry belonging to a user.
type Position struct {
	ID           uuid.UUID  `json:"id"`
	UserID       uuid.UUID  `json:"user_id"`
	JobTitle     *string    `json:"job_title,omitempty"`
	Organization *string    `json:"organization,omitempty"`
	StartDate    *time.Time `json:"start_date,omitempty"`
	EndDate      *time.Time `json:"end_date,omitempty"`
	IsCurrent    bool       `json:"is_current"`
}

// Education is an academic record belonging to a user.
type Education struct {
	ID         uuid.UUID  `json:"id"`
	UserID     uuid.UUID  `json:"user_id"`
	SchoolName *string    `json:"school_name,omitempty"`
	StartDate  *time.Time `json:"start_date,omitempty"`
	EndDate    *time.Time `json:"end_date,omitempty"`
}

// Contact is a social or professional link belonging to a user.
type Contact struct {
	ID     uuid.UUID `json:"id"`
	UserID uuid.UUID `json:"user_id"`
	Type   string    `json:"type"`
	URL    *string   `json:"url,omitempty"`
}

// Skill is a professional skill belonging to a user.
type Skill struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	Name      string    `json:"name"`
	Category  *string   `json:"category,omitempty"`
	SortOrder int       `json:"sort_order"`
}
