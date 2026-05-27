package handler

import (
	"net/http"

	"resume/internal/render"
	"resume/internal/service"
)

// AuthHandler handles registration and login endpoints.
type AuthHandler struct {
	svc service.AuthService
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(svc service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

func (h *AuthHandler) register(w http.ResponseWriter, r *http.Request) {
	req, err := decodeJSON[service.RegisterRequest](r)
	if err != nil {
		render.Error(w, err)
		return
	}
	token, err := h.svc.Register(r.Context(), req)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusCreated, map[string]string{"token": token})
}

func (h *AuthHandler) login(w http.ResponseWriter, r *http.Request) {
	req, err := decodeJSON[service.LoginRequest](r)
	if err != nil {
		render.Error(w, err)
		return
	}
	token, err := h.svc.Login(r.Context(), req)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusOK, map[string]string{"token": token})
}
