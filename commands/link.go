package commands

import (
	"context"

	"github.com/bwmarrin/discordgo"

	"sdc/domain"
	"sdc/models"
)

func Link(d *Deps, s *discordgo.Session, i *discordgo.InteractionCreate) error {
	ctx := context.Background()
	social, _ := optionString(i, "сайт")
	linkMeta, ok := domain.SocialLinks[social]
	if !ok {
		deleteDeferred(s, i)
		return followupEphemeral(s, i, &discordgo.WebhookParams{Content: "Неизвестный тип ссылки!"})
	}

	socials, err := d.Store.GuildSocials(ctx, i.GuildID)
	if err != nil {
		return err
	}
	key := domain.SocialKey(social)
	path := ""
	if socials != nil {
		path = socials[key]
	}
	if path == "" {
		deleteDeferred(s, i)
		return followupEphemeral(s, i, &discordgo.WebhookParams{Content: "Такая ссылка у сервера не задана!"})
	}

	url := linkMeta.URL + path
	author := &discordgo.MessageEmbedAuthor{Name: linkMeta.Name, URL: url}
	if linkMeta.Icon != "" {
		author.IconURL = linkMeta.Icon
	}

	embed := &discordgo.MessageEmbed{
		Color:  models.EmbedColors["blue"],
		Author: author,
		Footer: &discordgo.MessageEmbedFooter{Text: "Ссылка, указанная на сайте мониторинга."},
	}
	return editReply(s, i, &discordgo.WebhookEdit{Embeds: &[]*discordgo.MessageEmbed{embed}})
}
