// Package config provides application configuration loaded from environment variables.
package config

import (
	"fmt"

	"github.com/ilyakaznacheev/cleanenv"
)

// Config holds application-level configuration.
type Config struct {
	Env           string   `env:"ENV"            env-default:"development"`
	HTTPPort      string   `env:"HTTP_PORT"      env-default:"8080"`
	DatabaseURL   string   `env:"PG_DSN"`
	MigrationsDir string   `env:"MIGRATIONS_DIR" env-default:"migrations"`
	CORSOrigins   []string `env:"CORS_ORIGINS"   env-default:"http://localhost:3000,http://localhost:5173" env-separator:","`
	UploadDir     string   `env:"UPLOAD_DIR"     env-default:"web/uploads"`
	JWTSecret     string   `env:"JWT_SECRET"     env-required:"true"`
}

// New loads configuration from .env and environment variables.
func New() (*Config, error) {
	var cfg Config
	err := cleanenv.ReadConfig(".env", &cfg)
	if err != nil {
		return nil, fmt.Errorf("config: read: %w", err)
	}
	return &cfg, nil
}
