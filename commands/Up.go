package commands

import (
	"github.com/bwmarrin/discordgo"
	"sdc/models"
	"sdc/service"
)

func Up(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
	guild, _ := session.Guild(interaction.GuildID)

	captchaKey := service.RandomString(4, "1234567890")
	captchaImage := service.GenerateCaptcha(captchaKey)

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
		},
	})
}
