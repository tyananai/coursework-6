package service

import (
	"context"
	"fmt"

	"resume/internal/models"
	"resume/internal/repository"
)

// IndustryService defines read operations on industries.
type IndustryService interface {
	ListIndustries(ctx context.Context) ([]*models.Industry, error)
}

type industryService struct {
	industries repository.IndustryRepository
}

// NewIndustryService creates a new IndustryService.
func NewIndustryService(industries repository.IndustryRepository) IndustryService {
	return &industryService{industries: industries}
}

func (s *industryService) ListIndustries(ctx context.Context) ([]*models.Industry, error) {
	list, err := s.industries.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("industryService.ListIndustries: %w", err)
	}
	return list, nil
}
