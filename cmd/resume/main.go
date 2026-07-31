// Package main is the entry point for the resume API server.
package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"

	"resume/internal/auth"
	"resume/internal/config"
	"resume/internal/handler"
	"resume/internal/repository"
	"resume/internal/service"
)

const (
	shutdownTimeout   = 15 * time.Second
	readHeaderTimeout = 5 * time.Second
	poolMaxConns      = 10
	poolMinConns      = 2
	poolMaxLifetime   = 30 * time.Minute
	poolMaxIdleTime   = 5 * time.Minute
)

func main() {
	err := run()
	if err != nil {
		slog.Error("Fatal", slog.Any("error", err))
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.New()
	if err != nil {
		return fmt.Errorf("config: %w", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	pool, err := newPool(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()

	err = pool.Ping(ctx)
	if err != nil {
		return fmt.Errorf("pool.Ping: %w", err)
	}
	slog.Info("Database connection pool ready")

	err = runMigrations(pool, cfg.MigrationsDir)
	if err != nil {
		return err
	}
	slog.Info("Migrations applied")

	repos := buildRepositories(pool)
	svc := service.NewServices(repos)

	tokens := auth.NewTokenService(cfg.JWTSecret)
	authSvc := service.NewAuthService(repos.Accounts, tokens)

	h := handler.NewHandler(svc, authSvc, tokens, cfg.CORSOrigins, cfg.UploadDir)

	srv := &http.Server{
		Addr:              ":" + cfg.HTTPPort,
		Handler:           h.Routes(),
		ReadHeaderTimeout: readHeaderTimeout,
	}

	go func() {
		slog.Info("Server starting", slog.String("addr", srv.Addr))
		serveErr := srv.ListenAndServe()
		if serveErr != nil && !errors.Is(serveErr, http.ErrServerClosed) {
			slog.Error("Server error", slog.Any("error", serveErr))
		}
	}()

	<-ctx.Done()
	stop()
	slog.Info("Shutting down")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	err = srv.Shutdown(shutdownCtx)
	if err != nil {
		return fmt.Errorf("server shutdown: %w", err)
	}
	return nil
}

func buildRepositories(pool *pgxpool.Pool) service.Repositories {
	return service.Repositories{
		Accounts:   repository.NewAccountRepository(pool),
		Users:      repository.NewUserRepository(pool),
		Positions:  repository.NewPositionRepository(pool),
		Education:  repository.NewEducationRepository(pool),
		Contacts:   repository.NewContactRepository(pool),
		Skills:     repository.NewSkillRepository(pool),
		Regions:    repository.NewRegionRepository(pool),
		Industries: repository.NewIndustryRepository(pool),
	}
}

func newPool(ctx context.Context, dsn string) (*pgxpool.Pool, error) {
	poolCfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("pgxpool.ParseConfig: %w", err)
	}
	poolCfg.MaxConns = poolMaxConns
	poolCfg.MaxConnLifetime = poolMaxLifetime
	poolCfg.MaxConnIdleTime = poolMaxIdleTime
	poolCfg.MinConns = poolMinConns

	pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
	if err != nil {
		return nil, fmt.Errorf("pgxpool.NewWithConfig: %w", err)
	}
	return pool, nil
}

func runMigrations(pool *pgxpool.Pool, dir string) error {
	sqlDB := stdlib.OpenDBFromPool(pool)
	defer func() {
		closeErr := sqlDB.Close()
		if closeErr != nil {
			slog.Warn("Failed to close sqlDB", slog.Any("error", closeErr))
		}
	}()

	err := goose.SetDialect("postgres")
	if err != nil {
		return fmt.Errorf("goose.SetDialect: %w", err)
	}
	err = goose.Up(sqlDB, dir)
	if err != nil {
		return fmt.Errorf("goose.Up: %w", err)
	}
	return nil
}
