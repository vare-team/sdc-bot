package events

import (
	"github.com/bwmarrin/discordgo"

	"sdc/commands"
	"sdc/utils"
)

func InteractionCreate(d *commands.Deps, s *discordgo.Session, i *discordgo.InteractionCreate) {
	if i.Type != discordgo.InteractionApplicationCommand {
		return
	}
	if i.GuildID == "" {
		return
	}

	name := i.ApplicationCommandData().Name
	ephemeral, _ := commands.OptionBool(i, "ephemeral")

	switch name {
	case "shards":
		if _, set := commands.OptionBool(i, "ephemeral"); !set {
			ephemeral = true
		}
	}

	if err := commands.DeferReply(s, i, ephemeral); err != nil {
		utils.Log("defer %s: %v", name, err)
		return
	}

	var err error
	switch name {
	case "up":
		err = commands.Up(d, s, i)
	case "info":
		err = commands.Info(d, s, i)
	case "link":
		err = commands.Link(d, s, i)
	case "shards":
		err = commands.Shards(d, s, i)
	case "remove":
		err = commands.Remove(d, s, i)
	default:
		return
	}
	if err != nil {
		utils.Log("command %s: %v", name, err)
		msg := "Произошла ошибка при выполнении команды."
		_, _ = s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
			Content: &msg,
		})
	}
}
