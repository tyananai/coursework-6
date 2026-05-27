package service

import (
	"context"
	"fmt"

	"resume/internal/models"
	"resume/internal/repository"
)

// RegionService defines read operations on regions.
type RegionService interface {
	ListRegions(ctx context.Context) ([]*models.Region, error)
}

type regionService struct {
	regions repository.RegionRepository
}

// NewRegionService creates a new RegionService.
func NewRegionService(regions repository.RegionRepository) RegionService {
	return &regionService{regions: regions}
}

func (s *regionService) ListRegions(ctx context.Context) ([]*models.Region, error) {
	list, err := s.regions.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("regionService.ListRegions: %w", err)
	}
	return list, nil
}
