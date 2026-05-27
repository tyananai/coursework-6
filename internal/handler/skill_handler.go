package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"resume/internal/render"
	"resume/internal/service"
)

// SkillHandler handles skill-related HTTP routes nested under /users/{id}.
type SkillHandler struct {
	svc service.SkillService
}

// NewSkillHandler creates a new SkillHandler.
func NewSkillHandler(svc service.SkillService) *SkillHandler {
	return &SkillHandler{svc: svc}
}

// Mount registers skill routes on the given router.
func (h *SkillHandler) Mount(r chi.Router) {
	r.Post("/", h.create)
	r.Put("/{sid}", h.update)
	r.Delete("/{sid}", h.delete)
}

func (h *SkillHandler) create(w http.ResponseWriter, r *http.Request) {
	userID, err := parseUUID(r, "id")
	if err != nil {
		render.Error(w, err)
		return
	}
	req, err := decodeJSON[service.CreateSkillRequest](r)
	if err != nil {
		render.Error(w, err)
		return
	}
	req.UserID = userID
	sk, err := h.svc.CreateSkill(r.Context(), req)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusCreated, sk)
}

func (h *SkillHandler) update(w http.ResponseWriter, r *http.Request) {
	sid, err := parseUUID(r, "sid")
	if err != nil {
		render.Error(w, err)
		return
	}
	req, err := decodeJSON[service.UpdateSkillRequest](r)
	if err != nil {
		render.Error(w, err)
		return
	}
	sk, err := h.svc.UpdateSkill(r.Context(), sid, req)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusOK, sk)
}

func (h *SkillHandler) delete(w http.ResponseWriter, r *http.Request) {
	sid, err := parseUUID(r, "sid")
	if err != nil {
		render.Error(w, err)
		return
	}
	if err = h.svc.DeleteSkill(r.Context(), sid); err != nil {
		render.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
