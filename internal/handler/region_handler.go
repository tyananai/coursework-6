package handler

import (
	"net/http"

	"resume/internal/render"
	"resume/internal/service"
)

// RegionHandler handles region-related HTTP routes.
type RegionHandler struct {
	svc service.RegionService
}

// NewRegionHandler creates a new RegionHandler.
func NewRegionHandler(svc service.RegionService) *RegionHandler {
	return &RegionHandler{svc: svc}
}

// List handles GET /api/v1/regions.
func (h *RegionHandler) List(w http.ResponseWriter, r *http.Request) {
	regions, err := h.svc.ListRegions(r.Context())
	if err != nil {
		render.Error(w, err)
		return
	}
	render.JSON(w, http.StatusOK, regions)
}
