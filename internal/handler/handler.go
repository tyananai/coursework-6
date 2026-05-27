// Package handler contains HTTP route handlers.
package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"resume/internal/auth"
	"resume/internal/middleware"
	"resume/internal/service"
)

// Handler holds dependencies for HTTP handlers.
type Handler struct {
	svc       service.Services
	authSvc   service.AuthService
	tokens    *auth.TokenService
	origins   []string
	uploadDir string
}

// NewHandler creates a new Handler with the given services, auth service, token service, CORS origins and upload directory.
func NewHandler(svc service.Services, authSvc service.AuthService, tokens *auth.TokenService, origins []string, uploadDir string) *Handler {
	return &Handler{svc: svc, authSvc: authSvc, tokens: tokens, origins: origins, uploadDir: uploadDir}
}

// Routes configures and returns the HTTP router with all middleware applied.
func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(
		middleware.RequestID,
		middleware.Logger,
		middleware.Recoverer,
		middleware.SecurityHeaders,
		middleware.NewCORS(h.origins),
	)
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", http.FileServer(http.Dir(h.uploadDir))))
	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", h.health)
		r.Get("/regions", NewRegionHandler(h.svc.Regions).List)
		r.Get("/industries", NewIndustryHandler(h.svc.Industries).List)

		authH := NewAuthHandler(h.authSvc)
		r.Post("/auth/register", authH.register)
		r.Post("/auth/login", authH.login)

		r.Route("/users", NewUserHandler(h.svc, h.uploadDir, h.tokens).Mount)
	})
	r.Handle("/*", http.FileServer(http.Dir("web")))
	return r
}

func (*Handler) health(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
}
