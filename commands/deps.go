package commands

import (
	"github.com/bwmarrin/discordgo"

	"sdc/integrations"
	"sdc/store"
)

type CachedGuild struct {
	ID          string
	Name        string
	Icon        string
	OwnerID     string
	MemberCount int
	ShardID     int
}

func (g CachedGuild) IconURL() string {
	if g.Icon == "" {
		return ""
	}
	return discordgo.EndpointGuildIcon(g.ID, g.Icon)
}

type GuildCache interface {
	Get(id string) (CachedGuild, bool)
	Upsert(g CachedGuild)
	Delete(id string)
	GetOrFetch(s *discordgo.Session, guildID string, shardID int) (CachedGuild, error)
}

type ShardSnap struct {
	ID     int
	Guilds int
	PingMS int
	HeapMB float64
	Ready  bool
}

type Runtime interface {
	TotalGuilds() int
	ShardCount() int
	ShardSnapshots() []ShardSnap
}

type Deps struct {
	Store   *store.Store
	Cache   GuildCache
	Captcha *store.CaptchaStore
	Webhook *integrations.Webhook
	Metrics *integrations.Metrics
	Runtime Runtime
}

func optionBool(i *discordgo.InteractionCreate, name string) (bool, bool) {
	for _, opt := range i.ApplicationCommandData().Options {
		if opt.Name == name {
			return opt.BoolValue(), true
		}
	}
	return false, false
}

func optionInt(i *discordgo.InteractionCreate, name string) (int64, bool) {
	for _, opt := range i.ApplicationCommandData().Options {
		if opt.Name == name {
			return opt.IntValue(), true
		}
	}
	return 0, false
}

func optionString(i *discordgo.InteractionCreate, name string) (string, bool) {
	for _, opt := range i.ApplicationCommandData().Options {
		if opt.Name == name {
			return opt.StringValue(), true
		}
	}
	return "", false
}

func authorEmbed(guild CachedGuild) *discordgo.MessageEmbedAuthor {
	a := &discordgo.MessageEmbedAuthor{
		Name: guild.Name,
		URL:  "https://server-discord.com/" + guild.ID,
	}
	if u := guild.IconURL(); u != "" {
		a.IconURL = u
	}
	return a
}

func deferReply(s *discordgo.Session, i *discordgo.InteractionCreate, ephemeral bool) error {
	var flags discordgo.MessageFlags
	if ephemeral {
		flags = discordgo.MessageFlagsEphemeral
	}
	return s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseDeferredChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{Flags: flags},
	})
}

func editReply(s *discordgo.Session, i *discordgo.InteractionCreate, data *discordgo.WebhookEdit) error {
	_, err := s.InteractionResponseEdit(i.Interaction, data)
	return err
}

func followupEphemeral(s *discordgo.Session, i *discordgo.InteractionCreate, data *discordgo.WebhookParams) error {
	data.Flags = discordgo.MessageFlagsEphemeral
	_, err := s.FollowupMessageCreate(i.Interaction, true, data)
	return err
}

func deleteDeferred(s *discordgo.Session, i *discordgo.InteractionCreate) {
	_ = s.InteractionResponseDelete(i.Interaction)
}

func strPtr(s string) *string { return &s }

// Exported helpers for the events package router.
func OptionBool(i *discordgo.InteractionCreate, name string) (bool, bool) {
	return optionBool(i, name)
}

func DeferReply(s *discordgo.Session, i *discordgo.InteractionCreate, ephemeral bool) error {
	return deferReply(s, i, ephemeral)
}
