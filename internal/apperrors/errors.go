// Package apperrors defines typed sentinel errors for the application.
package apperrors

import "errors"

var (
	// ErrNotFound is returned when a requested resource does not exist.
	ErrNotFound = errors.New("not found")
	// ErrConflict is returned when a resource already exists.
	ErrConflict = errors.New("conflict")
	// ErrBadRequest is returned when the request payload is invalid.
	ErrBadRequest = errors.New("bad request")
	// ErrValidation is returned when input fails validation.
	ErrValidation = errors.New("validation error")
	// ErrUnauthorized is returned when a request lacks valid authentication.
	ErrUnauthorized = errors.New("unauthorized")
)
