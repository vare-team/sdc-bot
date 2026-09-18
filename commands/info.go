package commands

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/bwmarrin/discordgo"

	"sdc/domain"
	"sdc/models"
	"sdc/utils"
)

func Info(d *Deps, s *discordgo.Session, i *discordgo.InteractionCreate) error {
	ctx := context.Background()
	guildMeta, err := d.Cache.GetOrFetch(s, i.GuildID, s.ShardID)
	if err != nil {
		return err
	}

	info, err := d.Store.GuildInfo(ctx, i.GuildID)
	if err != nil {
		return err
	}
	if info == nil {
		return editReply(s, i, &discordgo.WebhookEdit{
			Content: strPtr("Сервер не найден в мониторинге."),
		})
	}

	pins := domain.PinsForStatus(info.Status)
	pinText := "Не выданы"
	if len(pins) > 0 {
		parts := make([]string, 0, len(pins))
		for _, p := range pins {
			parts = append(parts, fmt.Sprintf("%s - %s", p.Icon, p.Name))
		}
		pinText = strings.Join(parts, "\n")
	}

	boostText := "[Отсутствует](https://server-discord.com/boost)"
	if info.Boost > 0 {
		name := domain.BoostName(info.Boost)
		if info.BoostEndAt != nil {
			boostText = fmt.Sprintf("«**Boost %s**», до <t:%d:D>", name, info.BoostEndAt.Unix())
		} else {
			boostText = fmt.Sprintf("«**Boost %s**»", name)
		}
	}

	season := domain.NextSeasonEnd(time.Now())
	authorName := fmt.Sprintf("Сервер «%s»", guildMeta.Name)
	author := &discordgo.MessageEmbedAuthor{
		Name: authorName,
		URL:  "https://server-discord.com/" + i.GuildID,
	}
	if u := guildMeta.IconURL(); u != "" {
		author.IconURL = u
	}

	embed := &discordgo.MessageEmbed{
		Author: author,
		Color:  models.EmbedColors["blue"],
		Fields: []*discordgo.MessageEmbedField{
			{
				Name:   "Продвижение:",
				Value:  fmt.Sprintf("%s Место на сайте: **%d**\n%s Всего UP очков: **%d**", models.Emojis["owner"], info.Place, models.Emojis["ups"], info.UpCount),
				Inline: true,
			},
			{
				Name:   "Информация:",
				Value:  fmt.Sprintf("%s Рейтинг: **%d**\n%s Отзывов: **%d**", models.Emojis["rating"], info.Rating, models.Emojis["comment"], info.Comments),
				Inline: true,
			},
			{Name: "Буст:", Value: boostText},
			{Name: "Значки: ", Value: pinText},
		},
		Footer: &discordgo.MessageEmbedFooter{
			Text: "Новый сезон через " + utils.BeforeDate(season, time.Now()),
		},
	}

	return editReply(s, i, &discordgo.WebhookEdit{Embeds: &[]*discordgo.MessageEmbed{embed}})
}
