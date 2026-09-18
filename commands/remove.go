package commands

import (
	"context"
	"fmt"
	"time"

	"github.com/bwmarrin/discordgo"

	"sdc/domain"
	"sdc/models"
	"sdc/utils"
)

func Remove(d *Deps, s *discordgo.Session, i *discordgo.InteractionCreate) error {
	if i.GuildID != domain.StaffGuildID {
		return nil
	}
	ctx := context.Background()
	id, ok := optionString(i, "id")
	if !ok || id == "" {
		return editReply(s, i, &discordgo.WebhookEdit{Content: strPtr("ID не валидный!")})
	}

	guild, err := s.Guild(id)
	if err != nil || guild == nil {
		return editReply(s, i, &discordgo.WebhookEdit{Content: strPtr("Гильдия не найдена!")})
	}

	if err := s.GuildLeave(id); err != nil {
		return err
	}
	if err := d.Store.SoftDeleteGuild(ctx, id); err != nil {
		return err
	}
	d.Cache.Delete(id)

	utils.Log("Removing guild: %s (%s)", guild.Name, guild.ID)

	author := &discordgo.MessageEmbedAuthor{
		Name: fmt.Sprintf("Успешно! Сервер «%s» удален!", guild.Name),
	}
	if guild.Icon != "" {
		author.IconURL = discordgo.EndpointGuildIcon(guild.ID, guild.Icon)
	}

	embed := &discordgo.MessageEmbed{
		Author:    author,
		Color:     models.EmbedColors["green"],
		Timestamp: time.Now().Format(time.RFC3339),
		Footer:    &discordgo.MessageEmbedFooter{Text: i.Member.User.String()},
	}
	return editReply(s, i, &discordgo.WebhookEdit{Embeds: &[]*discordgo.MessageEmbed{embed}})
}
