package domain

import (
	"encoding/json"
	"time"
)

const (
	FavoriteStatusBit = 0x8
	UpCooldown        = 4 * time.Hour
	CaptchaTTL        = 15 * time.Second
	StaffGuildID      = "669867414409969664" // shards + remove
	ShardsGuildID     = "669961614434500620" // shards only
	OpsGuildID        = "616205640938946560" // ops; no guilds row required
)

// InternalGuildIDs may host the bot without a monitoring row in guilds.
// GuildCreate must not leave them; cron must not flag them as missing.
var InternalGuildIDs = map[string]struct{}{
	StaffGuildID: {},
	OpsGuildID:   {},
}

func IsInternalGuild(id string) bool {
	_, ok := InternalGuildIDs[id]
	return ok
}

type Guild struct {
	ID         string
	Name       string
	Icon       string
	UpAt       time.Time
	Status     int64
	Boost      int
	BoostEndAt *time.Time
	UpCount    int64
	Members    int
	UserID     string
	IsBot      bool
	Socials    map[string]string
	DeletedAt  *time.Time
}

func (g Guild) HasBoost() bool {
	return g.Boost > 0
}

func (g Guild) IsFavorite() bool {
	return g.Status&FavoriteStatusBit != 0
}

func (g Guild) OnCooldown(now time.Time) bool {
	if g.UpAt.IsZero() {
		return false
	}
	return now.Sub(g.UpAt) <= UpCooldown
}

func (g Guild) CooldownEndsAt() time.Time {
	return g.UpAt.Add(UpCooldown)
}

func ParseSocials(raw []byte) map[string]string {
	if len(raw) == 0 {
		return nil
	}
	var socials map[string]string
	if err := json.Unmarshal(raw, &socials); err != nil {
		return nil
	}
	return socials
}
