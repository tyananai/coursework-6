// Package service contains business logic.
package service

import "resume/internal/repository"

// Repositories aggregates all data access dependencies needed by the services.
type Repositories struct {
	Accounts   repository.AccountRepository
	Users      repository.UserRepository
	Positions  repository.PositionRepository
	Education  repository.EducationRepository
	Contacts   repository.ContactRepository
	Skills     repository.SkillRepository
	Regions    repository.RegionRepository
	Industries repository.IndustryRepository
}

// Services aggregates all application services.
type Services struct {
	Users      UserService
	Positions  PositionService
	Education  EducationService
	Contacts   ContactService
	Skills     SkillService
	Regions    RegionService
	Industries IndustryService
}

// NewServices wires all services using the provided repositories.
func NewServices(repos Repositories) Services {
	return Services{
		Users:      NewUserService(repos.Users, repos.Positions, repos.Education, repos.Contacts, repos.Skills),
		Positions:  NewPositionService(repos.Positions, repos.Users),
		Education:  NewEducationService(repos.Education, repos.Users),
		Contacts:   NewContactService(repos.Contacts, repos.Users),
		Skills:     NewSkillService(repos.Skills, repos.Users),
		Regions:    NewRegionService(repos.Regions),
		Industries: NewIndustryService(repos.Industries),
	}
}
