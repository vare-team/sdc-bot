package commands

import (
	"github.com/bwmarrin/discordgo"
	"sdc/models"
	"sdc/service"
	"strconv"
	"time"
)

var codeBase = make(map[string]models.Codes)

func Up(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
	guild, _ := session.Guild(interaction.GuildID)

	enteredCode := interaction.ApplicationCommandData().Options[0]

	if generatedCode, ok := codeBase[interaction.GuildID+interaction.ChannelID]; ok && enteredCode.IntValue() != 0 {

		if generatedCode.Code == strconv.Itoa(int(enteredCode.IntValue())) {
			session.InteractionRespond(interaction.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "yes",
				},
			})

			delete(codeBase, interaction.GuildID+interaction.ChannelID)
		} else {
			session.InteractionRespond(interaction.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "no",
				},
			})
		}

		return
	}

	captchaKey := service.RandomString(4, "1234567890")
	captchaImage := service.GenerateCaptcha(captchaKey)

	codeBase[interaction.GuildID+interaction.ChannelID] = models.Codes{
		Code:      captchaKey,
		TimeStamp: time.Now(),
	}

	session.InteractionRespond(interaction.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Files: []*discordgo.File{
				{
					Name:        "captcha.png",
					ContentType: "image/png",
					Reader:      captchaImage,
				},
			},
			Embeds: []*discordgo.MessageEmbed{
				{
					Description: "Введите число, написанное на изображении, используя команду `/up [код:]`",
					Color:       models.EmbedColours["blue"],
					Author: &discordgo.MessageEmbedAuthor{
						Name:    guild.Name,
						URL:     "https://server-discord.com/" + interaction.GuildID,
						IconURL: guild.IconURL(),
					},
					Footer: &discordgo.MessageEmbedFooter{
						Text: "⏳ Данный код будет действителен в течении 15 секунд!",
					},
					Image: &discordgo.MessageEmbedImage{
						URL: "attachment://captcha.png",
					},
				},
			},
			Flags: 1 << 6,
		},
	})
}
