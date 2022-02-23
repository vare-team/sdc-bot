package eventHandlers

import (
	"github.com/bwmarrin/discordgo"
	"sdc/commands"
)

func InteractionCreate(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
	commands.Up(session, interaction)
}
