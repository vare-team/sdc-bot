package commands

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/bwmarrin/discordgo"

	"sdc/domain"
	"sdc/models"
	"sdc/service"
	"sdc/store"
	"sdc/utils"
)

func Up(d *Deps, s *discordgo.Session, i *discordgo.InteractionCreate) error {
	ctx := context.Background()
	firstUpAt := time.Now()

	guildMeta, err := d.Cache.GetOrFetch(s, i.GuildID, s.ShardID)
	if err != nil {
		return err
	}

	dbGuild, err := d.Store.GuildByID(ctx, i.GuildID)
	if err != nil {
		return err
	}
	if dbGuild == nil {
		deleteDeferred(s, i)
		return followupEphemeral(s, i, &discordgo.WebhookParams{
			Embeds: []*discordgo.MessageEmbed{{
				Description: "Сервер не найден в мониторинге.",
				Color:       models.EmbedColors["red"],
				Author:      authorEmbed(guildMeta),
			}},
		})
	}

	embed := &discordgo.MessageEmbed{Author: authorEmbed(guildMeta)}

	if dbGuild.OnCooldown(firstUpAt) {
		ends := dbGuild.CooldownEndsAt().Unix()
		embed.Description = fmt.Sprintf("Up <t:%d:R>: <t:%d:T>", ends, ends)
		embed.Color = models.EmbedColors["red"]
		return editReply(s, i, &discordgo.WebhookEdit{Embeds: &[]*discordgo.MessageEmbed{embed}})
	}

	code, hasCode := optionInt(i, "код")
	var bumpUpAt time.Time

	if !dbGuild.HasBoost() {
		if !hasCode {
			captchaCode := service.RandomIntInclusive(1000, 9999)
			d.Captcha.Put(i.GuildID, i.Member.User.ID, captchaCode, firstUpAt)
			img, err := service.GenerateCaptcha(strconv.Itoa(captchaCode))
			if err != nil {
				return err
			}
			embed.Description = "Введите число, написанное на изображении, используя команду `/up XXXX`"
			embed.Color = models.EmbedColors["blue"]
			embed.Footer = &discordgo.MessageEmbedFooter{Text: "Срок действия кода: 15 секунд"}
			embed.Image = &discordgo.MessageEmbedImage{URL: "attachment://code.png"}
			deleteDeferred(s, i)
			_, err = s.FollowupMessageCreate(i.Interaction, true, &discordgo.WebhookParams{
				Flags:  discordgo.MessageFlagsEphemeral,
				Embeds: []*discordgo.MessageEmbed{embed},
				Files: []*discordgo.File{{
					Name:        "code.png",
					ContentType: "image/png",
					Reader:      img,
				}},
			})
			if err != nil {
				d.Captcha.Delete(i.GuildID, i.Member.User.ID)
				return err
			}
			d.Captcha.ArmTTL(i.GuildID, i.Member.User.ID)
			return nil
		}

		entry, ok := d.Captcha.Get(i.GuildID, i.Member.User.ID)
		if !ok {
			embed.Description = "Введите `/up` без кода, чтобы его сгенерировать!"
			embed.Color = models.EmbedColors["yellow"]
			deleteDeferred(s, i)
			return followupEphemeral(s, i, &discordgo.WebhookParams{Embeds: []*discordgo.MessageEmbed{embed}})
		}
		if int64(entry.Code) != code {
			embed.Description = "Код не верен!"
			embed.Color = models.EmbedColors["red"]
			deleteDeferred(s, i)
			return followupEphemeral(s, i, &discordgo.WebhookParams{Embeds: []*discordgo.MessageEmbed{embed}})
		}
		if d.Captcha.Expired(entry, time.Now()) {
			embed.Description = "Срок действия кода истёк!\nПолучите новый, прописав команду `/up`!"
			embed.Color = models.EmbedColors["red"]
			deleteDeferred(s, i)
			return followupEphemeral(s, i, &discordgo.WebhookParams{Embeds: []*discordgo.MessageEmbed{embed}})
		}
		bumpUpAt = entry.UpAt
	} else {
		bumpUpAt = firstUpAt
	}

	actor := domain.User{
		ID:       i.Member.User.ID,
		Username: i.Member.User.Username,
		Avatar:   i.Member.User.Avatar,
	}
	// Owner profile is best-effort and must NOT run under GET_LOCK: after a
	// 34-shard boot, discordgo User() queues behind GuildCreate rate limits
	// and held the bump lock for minutes ("thinking" + "already in process").
	owner := domain.User{ID: guildMeta.OwnerID}

	unlock, locked, err := d.Store.TryLockBump(ctx, i.GuildID)
	if err != nil {
		return err
	}
	if !locked {
		embed.Description = "Ап уже в процессе!"
		embed.Color = models.EmbedColors["red"]
		deleteDeferred(s, i)
		return followupEphemeral(s, i, &discordgo.WebhookParams{Embeds: []*discordgo.MessageEmbed{embed}})
	}

	// Critical section: re-read + atomic bump only, then release immediately.
	now := time.Now()
	dbGuild, err = d.Store.GuildByID(ctx, i.GuildID)
	if err != nil {
		_ = unlock()
		return err
	}
	if dbGuild == nil {
		_ = unlock()
		deleteDeferred(s, i)
		return followupEphemeral(s, i, &discordgo.WebhookParams{
			Embeds: []*discordgo.MessageEmbed{{
				Description: "Сервер не найден в мониторинге.",
				Color:       models.EmbedColors["red"],
				Author:      authorEmbed(guildMeta),
			}},
		})
	}
	if dbGuild.OnCooldown(now) {
		_ = unlock()
		ends := dbGuild.CooldownEndsAt().Unix()
		embed.Description = fmt.Sprintf("Up <t:%d:R>: <t:%d:T>", ends, ends)
		embed.Color = models.EmbedColors["red"]
		return editReply(s, i, &discordgo.WebhookEdit{Embeds: &[]*discordgo.MessageEmbed{embed}})
	}

	delta := domain.UpDelta(dbGuild.Status, dbGuild.Boost)
	upCountLog := dbGuild.UpCount + delta

	applied, err := d.Store.Bump(ctx, store.BumpParams{
		GuildID:      i.GuildID,
		UpAt:         bumpUpAt,
		Members:      guildMeta.MemberCount,
		OwnerID:      guildMeta.OwnerID,
		Actor:        actor,
		Owner:        owner,
		Delta:        delta,
		CooldownAsOf: now,
	})
	_ = unlock()
	if err != nil {
		return err
	}
	if !applied {
		fresh, ferr := d.Store.GuildByID(ctx, i.GuildID)
		if ferr != nil {
			return ferr
		}
		if fresh != nil && fresh.OnCooldown(time.Now()) {
			ends := fresh.CooldownEndsAt().Unix()
			embed.Description = fmt.Sprintf("Up <t:%d:R>: <t:%d:T>", ends, ends)
		} else {
			embed.Description = "Ап уже в процессе!"
		}
		embed.Color = models.EmbedColors["red"]
		return editReply(s, i, &discordgo.WebhookEdit{Embeds: &[]*discordgo.MessageEmbed{embed}})
	}

	utils.Log(`{Guild UP} Ups "%d", User "%s" (%s), Guild "%s" (%s), Channel ID %s`,
		upCountLog, i.Member.User.String(), i.Member.User.ID, guildMeta.Name, i.GuildID, i.ChannelID)

	_ = d.Webhook.SendEmbed(&discordgo.MessageEmbed{
		Description: fmt.Sprintf(
			"Guild: **[%s](https://server-discord.com/%s)**\nUser: `%s` | `%s`\n\nTimestamp: `%d`",
			guildMeta.Name, i.GuildID, i.Member.User.String(), i.Member.User.ID, bumpUpAt.UnixMilli(),
		),
		Color:  0x4997D0,
		Footer: &discordgo.MessageEmbedFooter{Text: "Emitted by Slash Command"},
	})

	embed.Description = fmt.Sprintf("**Успешный Up!**\nВремя фиксации апа: <t:%d:T>", bumpUpAt.Unix())
	embed.Color = models.EmbedColors["green"]

	if dbGuild.HasBoost() {
		place, upCount, err := d.Store.GuildPlace(ctx, i.GuildID)
		if err != nil {
			utils.Log("GuildPlace after bump %s: %v", i.GuildID, err)
		} else {
			embed.Fields = []*discordgo.MessageEmbedField{{
				Name: "Буст информация:",
				Value: fmt.Sprintf("%s Место на сайте: **%d**\n%s Всего UP очков: **%d**",
					models.Emojis["owner"], place, models.Emojis["ups"], upCount),
			}}
		}
	}

	if !dbGuild.HasBoost() {
		d.Captcha.Delete(i.GuildID, i.Member.User.ID)
	}

	_ = d.Metrics.Post("/ups", nil)

	return editReply(s, i, &discordgo.WebhookEdit{Embeds: &[]*discordgo.MessageEmbed{embed}})
}
