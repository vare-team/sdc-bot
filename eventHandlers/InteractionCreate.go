package eventHandlers

import (
	"github.com/bwmarrin/discordgo"
	"sdc/commands"
)

func InteractionCreate(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
	switch interaction.ApplicationCommandData().Name {
	case "up":
		commands.Up(session, interaction)
		break
	}
}
