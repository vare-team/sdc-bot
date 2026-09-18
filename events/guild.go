package events

import (
	"context"

	"github.com/bwmarrin/discordgo"

	"sdc/commands"
	"sdc/domain"
	"sdc/utils"
)

func GuildCreate(d *commands.Deps, s *discordgo.Session, g *discordgo.GuildCreate) {
	if g.Guild == nil {
		return
	}
	meta := commands.CachedGuild{
		ID:          g.ID,
		Name:        g.Name,
		Icon:        g.Icon,
		OwnerID:     g.OwnerID,
		MemberCount: g.MemberCount,
		ShardID:     s.ShardID,
	}
	d.Cache.Upsert(meta)

	if g.Unavailable {
		return
	}
	if domain.IsInternalGuild(g.ID) {
		return
	}

	ctx := context.Background()
	exists, err := d.Store.GuildExists(ctx, g.ID)
	if err != nil {
		utils.Log("guildCreate exists check %s: %v", g.ID, err)
		return
	}
	if !exists {
		if err := s.GuildLeave(g.ID); err != nil {
			utils.Log("guildCreate leave %s: %v", g.ID, err)
		}
		d.Cache.Delete(g.ID)
		return
	}

	// Do not call s.User here: on boot this fires per guild and rate-limits
	// the whole process (and used to stall /up while it held GET_LOCK).
	owner := domain.User{ID: g.OwnerID}
	if err := d.Store.ActivateBot(ctx, g.ID, g.MemberCount, owner); err != nil {
		utils.Log("guildCreate activate %s: %v", g.ID, err)
		return
	}
	_ = d.Metrics.Post("/sdc/added", d.Runtime.TotalGuilds())
}

func GuildDelete(d *commands.Deps, _ *discordgo.Session, g *discordgo.GuildDelete) {
	if g.Guild == nil {
		return
	}
	if g.Unavailable {
		return
	}
	d.Cache.Delete(g.ID)
	if domain.IsInternalGuild(g.ID) {
		return
	}
	ctx := context.Background()
	if err := d.Store.DeactivateBot(ctx, g.ID); err != nil {
		utils.Log("guildDelete deactivate %s: %v", g.ID, err)
		return
	}
	_ = d.Metrics.Post("/sdc/removed", d.Runtime.TotalGuilds())
}

func GuildUpdate(d *commands.Deps, s *discordgo.Session, g *discordgo.GuildUpdate) {
	if g.Guild == nil || g.Unavailable {
		return
	}
	old, ok := d.Cache.Get(g.ID)
	meta := commands.CachedGuild{
		ID:          g.ID,
		Name:        g.Name,
		Icon:        g.Icon,
		OwnerID:     g.OwnerID,
		MemberCount: g.MemberCount,
		ShardID:     s.ShardID,
	}
	d.Cache.Upsert(meta)

	if domain.IsInternalGuild(g.ID) {
		return
	}
	if ok && old.Icon == meta.Icon && old.Name == meta.Name && old.OwnerID == meta.OwnerID {
		return
	}

	owner := domain.User{ID: g.OwnerID}
	if g.OwnerID != "" {
		if u, err := s.User(g.OwnerID); err == nil {
			owner.Username = u.Username
			owner.Avatar = u.Avatar
		}
	}
	ctx := context.Background()
	if err := d.Store.SyncGuildProfile(ctx, g.ID, g.Name, g.Icon, g.MemberCount, owner); err != nil {
		utils.Log("guildUpdate sync %s: %v", g.ID, err)
	}
}
