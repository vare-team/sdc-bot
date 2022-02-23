package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/bwmarrin/discordgo"

	"sdc/eventHandlers"
)

var (
	Token string
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Print("No .env file found")
	}

	Token, _ = os.LookupEnv("DISCORD_TOKEN")
}

func main() {
	clientSession, err := discordgo.New("Bot " + Token)
	if err != nil {
		fmt.Println("error creating Discord session,", err)
		return
	}

	clientSession.AddHandler(eventHandlers.InteractionCreate)

	err = clientSession.Open()
	if err != nil {
		fmt.Println("error opening connection,", err)
		return
	}

	fmt.Println("Bot is now running.")
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt, os.Kill)
	<-sc

	err = clientSession.Close()
	if err != nil {
		return
	}
}
