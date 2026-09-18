package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"

	"sdc/bot"
	"sdc/config"
	"sdc/jobs"
	"sdc/store"
	"sdc/utils"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Print("No .env file found")
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	st, err := store.Open(cfg.DSN())
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer func() { _ = st.Close() }()

	mgr := bot.NewManager(cfg, st)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if err := mgr.Start(ctx); err != nil {
		log.Fatalf("bot start: %v", err)
	}
	defer mgr.Stop()

	cron := jobs.NewCron(st, mgr.Cache)
	cron.Start()
	defer cron.Stop()

	presence := jobs.NewPresence(mgr.Sessions, mgr.TotalGuilds)
	presence.Start()
	defer presence.Stop()

	utils.Log("Bot %s is now running. Press Ctrl+C to stop", mgr.BotName())
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM)
	<-sc
	utils.Log("Shutting down...")
}
