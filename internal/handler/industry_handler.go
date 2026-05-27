package handler

import (
	"net/http"

	"resume/internal/render"
	"resume/internal/service"
)

// IndustryHandler handles industry-related HTTP routes.
type IndustryHandler struct {
	svc service.IndustryService
}

// NewIndustryHandler creates a new IndustryHandler.
func NewIndustryHandler(svc service.IndustryService) *IndustryHandler {
	return &IndustryHandler{svc: svc}
}

// List handles GET /api/v1/industries.
func (h *IndustryHandler) List(w http.ResponseWriter, r *http.Request) {
	industries, err := h.svc.ListIndustries(r.Context())
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusOK, industries)
}
