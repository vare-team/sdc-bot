package bot

import (
	"fmt"

	"github.com/bwmarrin/discordgo"

	"sdc/commands"
	"sdc/domain"
	"sdc/events"
	"sdc/utils"
)

func (m *Manager) deps() *commands.Deps {
	return &commands.Deps{
		Store:   m.Store,
		Cache:   m.Cache.AsCommandsCache(),
		Captcha: m.Captcha,
		Webhook: m.Webhook,
		Metrics: m.Metrics,
		Runtime: m.AsRuntime(),
	}
}

func (m *Manager) bindHandlers(s *discordgo.Session) {
	d := m.deps()
	s.AddHandler(func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		events.InteractionCreate(d, s, i)
	})
	s.AddHandler(func(s *discordgo.Session, g *discordgo.GuildCreate) {
		events.GuildCreate(d, s, g)
	})
	s.AddHandler(func(s *discordgo.Session, g *discordgo.GuildDelete) {
		events.GuildDelete(d, s, g)
	})
	s.AddHandler(func(s *discordgo.Session, g *discordgo.GuildUpdate) {
		events.GuildUpdate(d, s, g)
	})
}

func cmdUp() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "up",
		Description: "Апнуть сервер на мониторинге",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionInteger,
				Name:        "код",
				Description: "Код с капчи",
				Required:    false,
			},
		},
	}
}

func cmdInfo() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "info",
		Description: "Информация о сервере на мониторинге",
	}
}

func cmdLink() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "link",
		Description: "Ссылка сервера с мониторинга",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionString,
				Name:        "сайт",
				Description: "Тип ссылки",
				Required:    true,
				Choices: []*discordgo.ApplicationCommandOptionChoice{
					{Name: "ВКонтакте", Value: "vk"},
					{Name: "YouTube", Value: "youtube"},
					{Name: "Twitch", Value: "twitch"},
					{Name: "Веб сайт", Value: "custom"},
				},
			},
		},
	}
}

func cmdShards() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "shards",
		Description: "Статус шардов бота",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionBoolean,
				Name:        "ephemeral",
				Description: "Скрыть ответ",
				Required:    false,
			},
		},
	}
}

func cmdRemove() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        "remove",
		Description: "Принудительно удалить сервер (staff)",
		Options: []*discordgo.ApplicationCommandOption{
			{
				Type:        discordgo.ApplicationCommandOptionString,
				Name:        "id",
				Description: "ID гильдии",
				Required:    true,
			},
		},
	}
}

func (m *Manager) RegisterCommands() error {
	s := m.AnySession()
	if s == nil {
		return nil
	}

	appID, err := m.applicationID(s)
	if err != nil {
		return err
	}

	public := []*discordgo.ApplicationCommand{cmdUp(), cmdInfo(), cmdLink()}
	shardsOnly := []*discordgo.ApplicationCommand{cmdShards()}
	shardsRemove := []*discordgo.ApplicationCommand{cmdShards(), cmdRemove()}
	devAll := []*discordgo.ApplicationCommand{cmdUp(), cmdInfo(), cmdLink(), cmdShards(), cmdRemove()}

	// Dev: all commands on DEV_GUILD_ID only (fast iteration).
	if guildID := m.Cfg.DevGuildID; guildID != "" {
		if err := m.overwriteGuildCommands(s, appID, guildID, devAll); err != nil {
			return err
		}
		utils.Log("Registered %d guild slash commands for DEV_GUILD_ID=%s", len(devAll), guildID)
		if m.Cfg.ClearGlobal {
			if _, err := s.ApplicationCommandBulkOverwrite(appID, "", []*discordgo.ApplicationCommand{}); err != nil {
				return fmt.Errorf("failed to clear global slash commands: %w", err)
			}
			utils.Log("Cleared global slash commands (CLEAR_GLOBAL_COMMANDS=1)")
		}
		return nil
	}

	// Prod: public globals + admin guild commands.
	if _, err := s.ApplicationCommandBulkOverwrite(appID, "", public); err != nil {
		return fmt.Errorf("global slash registration failed: %w", err)
	}
	utils.Log("Registered %d global slash commands", len(public))

	if err := m.overwriteGuildCommands(s, appID, domain.StaffGuildID, shardsRemove); err != nil {
		utils.Log("admin guild %s command registration skipped: %v", domain.StaffGuildID, err)
	} else {
		utils.Log("Registered shards+remove for guild %s", domain.StaffGuildID)
	}

	if err := m.overwriteGuildCommands(s, appID, domain.ShardsGuildID, shardsOnly); err != nil {
		utils.Log("admin guild %s command registration skipped: %v", domain.ShardsGuildID, err)
	} else {
		utils.Log("Registered shards for guild %s", domain.ShardsGuildID)
	}

	return nil
}

func (m *Manager) applicationID(s *discordgo.Session) (string, error) {
	if s.State != nil && s.State.User != nil && s.State.User.ID != "" {
		return s.State.User.ID, nil
	}
	u, err := s.User("@me")
	if err != nil {
		return "", err
	}
	return u.ID, nil
}

func (m *Manager) overwriteGuildCommands(s *discordgo.Session, appID, guildID string, defs []*discordgo.ApplicationCommand) error {
	if _, ok := m.Cache.Get(guildID); !ok {
		if _, err := s.Guild(guildID); err != nil {
			return fmt.Errorf("bot cannot access guild %s: %w", guildID, err)
		}
	}
	if _, err := s.ApplicationCommandBulkOverwrite(appID, guildID, defs); err != nil {
		return fmt.Errorf("bulk overwrite guild %s: %w", guildID, err)
	}
	return nil
}
