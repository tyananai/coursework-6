package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"resume/internal/render"
	"resume/internal/service"
)

// ContactHandler handles contact-related HTTP routes nested under /users/{id}.
type ContactHandler struct {
	svc service.ContactService
}

// NewContactHandler creates a new ContactHandler.
func NewContactHandler(svc service.ContactService) *ContactHandler {
	return &ContactHandler{svc: svc}
}

// Mount registers contact routes on the given router.
func (h *ContactHandler) Mount(r chi.Router) {
	r.Post("/", h.create)
	r.Put("/{cid}", h.update)
	r.Delete("/{cid}", h.delete)
}

func (h *ContactHandler) create(w http.ResponseWriter, r *http.Request) {
	userID, err := parseUUID(r, "id")
	if err != nil {
		render.Error(w, err)
		return
	}
	req, err := decodeJSON[service.CreateContactRequest](r)
	if err != nil {
		render.Error(w, err)
		return
	}
	req.UserID = userID
	c, err := h.svc.CreateContact(r.Context(), req)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusCreated, c)
}

func (h *ContactHandler) update(w http.ResponseWriter, r *http.Request) {
	cid, err := parseUUID(r, "cid")
	if err != nil {
		render.Error(w, err)
		return
	}
	req, err := decodeJSON[service.UpdateContactRequest](r)
	if err != nil {
		render.Error(w, err)
		return
	}
	c, err := h.svc.UpdateContact(r.Context(), cid, req)
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusOK, c)
}

func (h *ContactHandler) delete(w http.ResponseWriter, r *http.Request) {
	cid, err := parseUUID(r, "cid")
	if err != nil {
		render.Error(w, err)
		return
	}
	if err = h.svc.DeleteContact(r.Context(), cid); err != nil {
		render.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
