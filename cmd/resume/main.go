package main

import (
	"context"
	"log/slog"
	"time"

	"resume/internal/service"

	"resume/internal/repository"

	"github.com/ilyakaznacheev/cleanenv"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ConfigDatabase struct {
	DSN string `env:"PG_DSN"`
	// Port     string `env:"PORT" env-default:"5432"`
	// Host     string `env:"HOST" env-default:"localhost"`
	// Name     string `env:"NAME" env-default:"postgres"`
	// User     string `env:"USER" env-default:"user"`
	// Password string `env:"PASSWORD"`
}

var cfg ConfigDatabase

func main() {
	err := cleanenv.ReadConfig(".env", &cfg)
	if err != nil {
		slog.Error("cleanenv.ReadConfig", slog.Any("error", err))
		return
	}

	ctx := context.Background()

	config, err := pgxpool.ParseConfig(cfg.DSN)
	if err != nil {
		slog.Error("pgxpool.ParseConfig", slog.Any("error", err))
		return
	}

	config.MaxConns = 10
	config.MaxConnLifetime = 30 * time.Minute
	config.MaxConnIdleTime = 5 * time.Minute
	config.MinConns = 2

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		slog.Error("pgxpool.NewWithConfig", slog.Any("error", err))
		return
	}
	defer pool.Close()

	if err = pool.Ping(ctx); err != nil {
		slog.Error("pool.Ping", slog.Any("error", err))
		return
	}
	slog.Info("Пул соединений создан")
	ser := service.NewService(repository.NewClientRepository())
	if ser == nil {
		slog.Error("service.NewService", slog.Any("error", err))
		return
	}
}
