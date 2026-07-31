package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"resume/internal/apperrors"
	"resume/internal/middleware"
	"resume/internal/render"
	"resume/internal/service"
)

// PositionHandler handles position-related HTTP routes nested under /users/{id}.
type PositionHandler struct {
	svc service.PositionService
}

// NewPositionHandler creates a new PositionHandler.
func NewPositionHandler(svc service.PositionService) *PositionHandler {
	return &PositionHandler{svc: svc}
}

// Mount registers position routes on the given router.
func (h *PositionHandler) Mount(r chi.Router) {
	r.Post("/", h.create)
	r.Put("/{pid}", h.update)
	r.Delete("/{pid}", h.delete)
}

func (h *PositionHandler) create(w http.ResponseWriter, r *http.Request) {
	userID, err := parseUUID(r, "id")
	if err != nil {
		render.Error(w, err)
		return
	}
	req, err := decodeJSON[service.CreatePositionRequest](r)
	if err != nil {
		render.Error(w, err)
		return
	}
	req.UserID = userID
	pos, err := h.svc.CreatePosition(r.Context(), req)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusCreated, pos)
}

func (h *PositionHandler) update(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		render.Error(w, apperrors.ErrUnauthorized)
		return
	}
	pid, err := parseUUID(r, "pid")
	if err != nil {
		render.Error(w, err)
		return
	}
	req, err := decodeJSON[service.UpdatePositionRequest](r)
	if err != nil {
		render.Error(w, err)
		return
	}
	pos, err := h.svc.UpdatePosition(r.Context(), accountID, pid, req)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusOK, pos)
}

func (h *PositionHandler) delete(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		render.Error(w, apperrors.ErrUnauthorized)
		return
	}
	pid, err := parseUUID(r, "pid")
	if err != nil {
		render.Error(w, err)
		return
	}
	if err = h.svc.DeletePosition(r.Context(), accountID, pid); err != nil {
		render.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
