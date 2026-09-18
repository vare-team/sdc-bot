package domain

type SocialLink struct {
	Name string
	Icon string
	URL  string
}

// SocialLinks maps slash option values to monitoring site link prefixes.
// twitch uses twitch.tv (JS had typo twitch.tw — not copied).
var SocialLinks = map[string]SocialLink{
	"vk": {
		Name: "ВКонтакте",
		Icon: "https://cdn.discordapp.com/attachments/581070953703014403/880155948910538782/VK.com-logo.png",
		URL:  "https://vk.com/",
	},
	"youtube": {
		Name: "YouTube",
		Icon: "https://cdn.discordapp.com/attachments/581070953703014403/880157139916718170/YouTube_social_white_squircle_2017.png",
		URL:  "https://youtube.com/",
	},
	"twitch": {
		Name: "Twitch",
		Icon: "",
		URL:  "https://twitch.tv/",
	},
	"custom": {
		Name: "Веб сайт",
		Icon: "",
		URL:  "https://",
	},
}

func SocialKey(option string) string {
	if option == "custom" {
		return "website"
	}
	return option
}
