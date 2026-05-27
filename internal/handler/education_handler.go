package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"resume/internal/render"
	"resume/internal/service"
)

// EducationHandler handles education-related HTTP routes nested under /users/{id}.
type EducationHandler struct {
	svc service.EducationService
}

// NewEducationHandler creates a new EducationHandler.
func NewEducationHandler(svc service.EducationService) *EducationHandler {
	return &EducationHandler{svc: svc}
}

// Mount registers education routes on the given router.
func (h *EducationHandler) Mount(r chi.Router) {
	r.Post("/", h.create)
	r.Put("/{eid}", h.update)
	r.Delete("/{eid}", h.delete)
}

func (h *EducationHandler) create(w http.ResponseWriter, r *http.Request) {
	userID, err := parseUUID(r, "id")
	if err != nil {
		render.Error(w, err)
		return
	}
	req, err := decodeJSON[service.CreateEducationRequest](r)
	if err != nil {
		render.Error(w, err)
		return
	}
	req.UserID = userID
	edu, err := h.svc.CreateEducation(r.Context(), req)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusCreated, edu)
}

func (h *EducationHandler) update(w http.ResponseWriter, r *http.Request) {
	eid, err := parseUUID(r, "eid")
	if err != nil {
		render.Error(w, err)
		return
	}
	req, err := decodeJSON[service.UpdateEducationRequest](r)
	if err != nil {
		render.Error(w, err)
		return
	}
	edu, err := h.svc.UpdateEducation(r.Context(), eid, req)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusOK, edu)
}

func (h *EducationHandler) delete(w http.ResponseWriter, r *http.Request) {
	eid, err := parseUUID(r, "eid")
	if err != nil {
		render.Error(w, err)
		return
	}
	if err = h.svc.DeleteEducation(r.Context(), eid); err != nil {
		render.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
