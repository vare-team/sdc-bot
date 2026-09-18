package bot

import (
	"sync"

	"github.com/bwmarrin/discordgo"
)

// GuildMeta is the thin permanent cache entry for a guild the bot is in.
type GuildMeta struct {
	ID          string
	Name        string
	Icon        string
	OwnerID     string
	MemberCount int
	Available   bool
	ShardID     int
}

func (g GuildMeta) IconURL() string {
	if g.Icon == "" {
		return ""
	}
	return discordgo.EndpointGuildIcon(g.ID, g.Icon)
}

// GuildCache is a process-wide thin guild cache (cache-first, gateway-written).
type GuildCache struct {
	mu   sync.RWMutex
	byID map[string]GuildMeta
}

func NewGuildCache() *GuildCache {
	return &GuildCache{byID: make(map[string]GuildMeta)}
}

func (c *GuildCache) Upsert(m GuildMeta) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.byID[m.ID] = m
}

func (c *GuildCache) Delete(id string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.byID, id)
}

func (c *GuildCache) Get(id string) (GuildMeta, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	m, ok := c.byID[id]
	return m, ok
}

// GetOrFetch returns cache hit, otherwise REST Guild and stores thin meta.
func (c *GuildCache) GetOrFetch(s *discordgo.Session, guildID string, shardID int) (GuildMeta, error) {
	if m, ok := c.Get(guildID); ok {
		return m, nil
	}
	g, err := s.Guild(guildID)
	if err != nil {
		return GuildMeta{}, err
	}
	m := MetaFromGuild(g, shardID)
	c.Upsert(m)
	return m, nil
}

func (c *GuildCache) IDs() []string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	out := make([]string, 0, len(c.byID))
	for id := range c.byID {
		out = append(out, id)
	}
	return out
}

func (c *GuildCache) Count() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return len(c.byID)
}

func (c *GuildCache) CountOnShard(shardID int) int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	n := 0
	for _, m := range c.byID {
		if m.ShardID == shardID {
			n++
		}
	}
	return n
}

func MetaFromGuild(g *discordgo.Guild, shardID int) GuildMeta {
	return GuildMeta{
		ID:          g.ID,
		Name:        g.Name,
		Icon:        g.Icon,
		OwnerID:     g.OwnerID,
		MemberCount: g.MemberCount,
		Available:   !g.Unavailable,
		ShardID:     shardID,
	}
}
