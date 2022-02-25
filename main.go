package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"

	"github.com/bwmarrin/discordgo"

	"sdc/events"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Print("No .env file found")
	}
}

func main() {
	session, err := discordgo.New("Bot " + os.Getenv("DISCORD_TOKEN"))
	if err != nil {
		log.Fatalf("error creating session: %s", err)
		return
	}
	session.AddHandler(events.InteractionCreate)

	err = session.Open()
	if err != nil {
		log.Fatalf("error opening websocket: %s", err)
		return
	}
	defer session.Close()

	fmt.Println("Bot is now running. Press Ctrl+C to stop")
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
	<-sc
}
