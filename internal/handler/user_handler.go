package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"resume/internal/apperrors"
	"resume/internal/auth"
	"resume/internal/middleware"
	"resume/internal/render"
	"resume/internal/service"
)

// UserHandler handles user-related HTTP routes.
type UserHandler struct {
	users     service.UserService
	positions service.PositionService
	education service.EducationService
	contacts  service.ContactService
	skills    service.SkillService
	uploadDir string
	tokens    *auth.TokenService
}

// NewUserHandler creates a new UserHandler with all sub-resource services, upload directory and token service.
func NewUserHandler(svc service.Services, uploadDir string, tokens *auth.TokenService) *UserHandler {
	return &UserHandler{
		users:     svc.Users,
		positions: svc.Positions,
		education: svc.Education,
		contacts:  svc.Contacts,
		skills:    svc.Skills,
		uploadDir: uploadDir,
		tokens:    tokens,
	}
}

// Mount registers all user routes and nested sub-resource routes.
func (h *UserHandler) Mount(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(middleware.NewAuth(h.tokens))
		r.Get("/", h.list)
		r.Post("/", h.create)
	})

	r.Route("/{id}", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			r.Use(middleware.NewAuth(h.tokens))
			r.Get("/", h.get)
			r.Put("/", h.update)
			r.Delete("/", h.delete)
			r.Post("/photo", NewPhotoHandler(h.users, h.uploadDir).upload)
			r.Route("/positions", NewPositionHandler(h.positions).Mount)
			r.Route("/education", NewEducationHandler(h.education).Mount)
			r.Route("/contacts", NewContactHandler(h.contacts).Mount)
			r.Route("/skills", NewSkillHandler(h.skills).Mount)
		})
	})
}

func (h *UserHandler) create(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		render.Error(w, apperrors.ErrUnauthorized)
		return
	}
	req, err := decodeJSON[service.CreateUserRequest](r)
	if err != nil {
		render.Error(w, err)
		return
	}
	user, err := h.users.CreateUser(r.Context(), accountID, req)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusCreated, user)
}

func (h *UserHandler) get(w http.ResponseWriter, r *http.Request) {
	id, err := parseUUID(r, "id")
	if err != nil {
		render.Error(w, err)
		return
	}
	user, err := h.users.GetUser(r.Context(), id)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusOK, user)
}

func (h *UserHandler) update(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		render.Error(w, apperrors.ErrUnauthorized)
		return
	}
	id, err := parseUUID(r, "id")
	if err != nil {
		render.Error(w, err)
		return
	}
	req, err := decodeJSON[service.UpdateUserRequest](r)
	if err != nil {
		render.Error(w, err)
		return
	}
	user, err := h.users.UpdateUser(r.Context(), accountID, id, req)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusOK, user)
}

func (h *UserHandler) delete(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		render.Error(w, apperrors.ErrUnauthorized)
		return
	}
	id, err := parseUUID(r, "id")
	if err != nil {
		render.Error(w, err)
		return
	}
	if err = h.users.DeleteUser(r.Context(), accountID, id); err != nil {
		render.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *UserHandler) list(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		render.Error(w, apperrors.ErrUnauthorized)
		return
	}
	filter := service.UserFilter{AccountID: &accountID}
	if raw := r.URL.Query().Get("region_id"); raw != "" {
		if id, err := uuid.Parse(raw); err == nil {
			filter.RegionID = &id
		}
	}
	if raw := r.URL.Query().Get("industry_id"); raw != "" {
		if id, err := uuid.Parse(raw); err == nil {
			filter.IndustryID = &id
		}
	}
	users, err := h.users.ListUsers(r.Context(), filter)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusOK, users)
}
