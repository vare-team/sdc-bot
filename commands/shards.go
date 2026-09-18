package commands

import (
	"fmt"

	"github.com/bwmarrin/discordgo"

	"sdc/models"
)

func Shards(d *Deps, s *discordgo.Session, i *discordgo.InteractionCreate) error {
	snaps := d.Runtime.ShardSnapshots()
	botUser := s.State.User
	author := &discordgo.MessageEmbedAuthor{Name: "SDC", URL: "https://server-discord.com"}
	if botUser != nil {
		author.Name = botUser.Username
		author.IconURL = botUser.AvatarURL("")
	}

	desc := ""
	totalGuilds := 0
	totalMem := 0.0
	for _, sn := range snaps {
		mark := ""
		if sn.ID == s.ShardID {
			mark = " ←"
		}
		desc += fmt.Sprintf("%d. %s%s\nСерверов: `%d`, Пинг: `%d` мс, ОЗУ: `%.2f` МБ\n",
			sn.ID+1, models.ShardName(sn.ID), mark, sn.Guilds, sn.PingMS, sn.HeapMB)
		totalGuilds += sn.Guilds
		totalMem += sn.HeapMB
	}

	embed := &discordgo.MessageEmbed{
		Author:      author,
		Color:       models.EmbedColors["blue"],
		Description: desc,
		Footer: &discordgo.MessageEmbedFooter{
			Text: "Шард сервера: " + models.ShardName(s.ShardID),
		},
		Fields: []*discordgo.MessageEmbedField{{
			Name:  "Всего",
			Value: fmt.Sprintf("Серверов: `%d`, ОЗУ: `%.2f` МБ", totalGuilds, totalMem),
		}},
	}

	ephemeral, set := optionBool(i, "ephemeral")
	if !set {
		ephemeral = true
	}
	_ = ephemeral // already deferred with correct flag

	return editReply(s, i, &discordgo.WebhookEdit{Embeds: &[]*discordgo.MessageEmbed{embed}})
}
