// Package render provides HTTP response helpers.
package render

import (
	"encoding/json"
	"errors"
	"net/http"

	"resume/internal/apperrors"
)

// APIResponse is the standard JSON envelope for all responses.
type APIResponse[T any] struct {
	Data  T       `json:"data"`
	Error *string `json:"error"`
}

// JSON writes a successful JSON response wrapped in APIResponse.
func JSON[T any](w http.ResponseWriter, status int, data T) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(APIResponse[T]{Data: data})
}

// Error maps an apperror to the correct HTTP status and writes a JSON error response.
func Error(w http.ResponseWriter, err error) {
	msg := userMsg(err)
	type errBody struct {
		Data  any     `json:"data"`
		Error *string `json:"error"`
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode(err))
	_ = json.NewEncoder(w).Encode(errBody{Data: nil, Error: &msg})
}

func statusCode(err error) int {
	switch {
	case errors.Is(err, apperrors.ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err, apperrors.ErrValidation), errors.Is(err, apperrors.ErrBadRequest):
		return http.StatusBadRequest
	case errors.Is(err, apperrors.ErrConflict):
		return http.StatusConflict
	case errors.Is(err, apperrors.ErrUnauthorized):
		return http.StatusUnauthorized
	default:
		return http.StatusInternalServerError
	}
}

func userMsg(err error) string {
	switch {
	case errors.Is(err, apperrors.ErrNotFound):
		return "not found"
	case errors.Is(err, apperrors.ErrConflict):
		return "conflict"
	case errors.Is(err, apperrors.ErrBadRequest):
		return "bad request"
	case errors.Is(err, apperrors.ErrValidation):
		return err.Error()
	case errors.Is(err, apperrors.ErrUnauthorized):
		return "unauthorized"
	default:
		return "internal server error"
	}
}
