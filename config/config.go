package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	DiscordToken string
	DBLogin      string
	DBPass       string
	DBHost       string
	DBName       string
	WebhookURL   string
	MetricAPIURL string
	DevGuildID   string
	ClearGlobal  bool
}

func Load() (Config, error) {
	token := os.Getenv("DISCORD_TOKEN")
	if token == "" {
		token = os.Getenv("TOKEN")
	}
	if token == "" {
		return Config{}, fmt.Errorf("DISCORD_TOKEN or TOKEN is required")
	}

	cfg := Config{
		DiscordToken: token,
		DBLogin:      os.Getenv("DBLOGIN"),
		DBPass:       os.Getenv("DBPASS"),
		DBHost:       os.Getenv("DBHOST"),
		DBName:       os.Getenv("DBNAME"),
		WebhookURL:   strings.TrimSpace(os.Getenv("WEBHOOK_URL")),
		MetricAPIURL: strings.TrimSpace(os.Getenv("METRIC_API_URL")),
		DevGuildID:   strings.TrimSpace(os.Getenv("DEV_GUILD_ID")),
		ClearGlobal: strings.EqualFold(strings.TrimSpace(os.Getenv("CLEAR_GLOBAL_COMMANDS")), "true") ||
			strings.TrimSpace(os.Getenv("CLEAR_GLOBAL_COMMANDS")) == "1",
	}

	if cfg.DBLogin == "" || cfg.DBHost == "" || cfg.DBName == "" {
		return Config{}, fmt.Errorf("DBLOGIN, DBHOST, and DBNAME are required")
	}

	return cfg, nil
}

func (c Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=true&charset=utf8mb4&collation=utf8mb4_unicode_ci&multiStatements=true",
		c.DBLogin, c.DBPass, c.DBHost, c.DBName)
}
