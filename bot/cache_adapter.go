package bot

import (
	"github.com/bwmarrin/discordgo"

	"sdc/commands"
)

type cacheAdapter struct {
	c *GuildCache
}

func (c *GuildCache) AsCommandsCache() commands.GuildCache {
	return &cacheAdapter{c: c}
}

func (a *cacheAdapter) Get(id string) (commands.CachedGuild, bool) {
	m, ok := a.c.Get(id)
	if !ok {
		return commands.CachedGuild{}, false
	}
	return toCached(m), true
}

func (a *cacheAdapter) Upsert(g commands.CachedGuild) {
	a.c.Upsert(GuildMeta{
		ID:          g.ID,
		Name:        g.Name,
		Icon:        g.Icon,
		OwnerID:     g.OwnerID,
		MemberCount: g.MemberCount,
		Available:   true,
		ShardID:     g.ShardID,
	})
}

func (a *cacheAdapter) Delete(id string) {
	a.c.Delete(id)
}

func (a *cacheAdapter) GetOrFetch(s *discordgo.Session, guildID string, shardID int) (commands.CachedGuild, error) {
	m, err := a.c.GetOrFetch(s, guildID, shardID)
	if err != nil {
		return commands.CachedGuild{}, err
	}
	return toCached(m), nil
}

func toCached(m GuildMeta) commands.CachedGuild {
	return commands.CachedGuild{
		ID:          m.ID,
		Name:        m.Name,
		Icon:        m.Icon,
		OwnerID:     m.OwnerID,
		MemberCount: m.MemberCount,
		ShardID:     m.ShardID,
	}
}

func (m *Manager) ShardSnapshotsCmd() []commands.ShardSnap {
	raw := m.ShardSnapshots()
	out := make([]commands.ShardSnap, len(raw))
	for i, s := range raw {
		out[i] = commands.ShardSnap{
			ID:     s.ID,
			Guilds: s.Guilds,
			PingMS: s.PingMS,
			HeapMB: s.HeapMB,
			Ready:  s.Ready,
		}
	}
	return out
}

// Runtime adapter
type runtimeAdapter struct {
	m *Manager
}

func (m *Manager) AsRuntime() commands.Runtime {
	return &runtimeAdapter{m: m}
}

func (r *runtimeAdapter) TotalGuilds() int { return r.m.TotalGuilds() }
func (r *runtimeAdapter) ShardCount() int  { return r.m.ShardCount() }
func (r *runtimeAdapter) ShardSnapshots() []commands.ShardSnap {
	return r.m.ShardSnapshotsCmd()
}
