package jobs

import (
	"context"
	"fmt"
	"time"

	"github.com/bwmarrin/discordgo"

	"sdc/domain"
	"sdc/store"
	"sdc/utils"
)

type IDSource interface {
	IDs() []string
}

type Cron struct {
	Store  *store.Store
	IDs    IDSource
	stopCh chan struct{}
}

func NewCron(st *store.Store, ids IDSource) *Cron {
	return &Cron{Store: st, IDs: ids, stopCh: make(chan struct{})}
}

func (c *Cron) Start() {
	go func() {
		now := time.Now()
		next := now.Truncate(time.Hour).Add(time.Hour)
		timer := time.NewTimer(time.Until(next))
		defer timer.Stop()
		for {
			select {
			case <-c.stopCh:
				return
			case <-timer.C:
				c.run()
				timer.Reset(time.Hour)
			}
		}
	}()
}

func (c *Cron) Stop() {
	select {
	case <-c.stopCh:
	default:
		close(c.stopCh)
	}
}

func (c *Cron) run() {
	utils.Log("Cron: sync start!")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	live := c.IDs.IDs()
	utils.Log("Cron: live guilds=%d", len(live))
	if err := c.Store.SyncIsBot(ctx, live); err != nil {
		utils.Log("Cron: sync is_bot: %v", err)
	}
	missing, err := c.Store.MissingFromDB(ctx, live)
	if err != nil {
		utils.Log("Cron: missing check: %v", err)
	} else {
		filtered := missing[:0]
		for _, id := range missing {
			if !domain.IsInternalGuild(id) {
				filtered = append(filtered, id)
			}
		}
		if len(filtered) > 0 {
			utils.Log("Cron: not in db (log only, no kick) count=%d ids=%v", len(filtered), filtered)
		}
	}
	utils.Log("Cron: sync end!")
}

type Presence struct {
	Sessions func() []*discordgo.Session
	Guilds   func() int
	stopCh   chan struct{}
}

func NewPresence(sessions func() []*discordgo.Session, guilds func() int) *Presence {
	return &Presence{Sessions: sessions, Guilds: guilds, stopCh: make(chan struct{})}
}

func (p *Presence) Start() {
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		i := 0
		p.update(i)
		for {
			select {
			case <-p.stopCh:
				return
			case <-ticker.C:
				i++
				p.update(i)
			}
		}
	}()
}

func (p *Presence) Stop() {
	select {
	case <-p.stopCh:
	default:
		close(p.stopCh)
	}
}

func (p *Presence) update(i int) {
	n := p.Guilds()
	var status discordgo.UpdateStatusData
	switch i % 3 {
	case 0:
		status = discordgo.UpdateStatusData{
			Activities: []*discordgo.Activity{{
				Name: fmt.Sprintf("серверов: %d | /up", n),
				Type: discordgo.ActivityTypeWatching,
			}},
			Status: "online",
		}
	case 1:
		status = discordgo.UpdateStatusData{
			Activities: []*discordgo.Activity{{
				Name: "/up | /info",
				Type: discordgo.ActivityTypeListening,
			}},
			Status: "online",
		}
	default:
		status = discordgo.UpdateStatusData{
			Activities: []*discordgo.Activity{{
				Name: "Апнуть сервер - /up",
				Type: discordgo.ActivityTypeListening,
			}},
			Status: "online",
		}
	}
	for _, s := range p.Sessions() {
		if s != nil && s.DataReady {
			_ = s.UpdateStatusComplex(status)
		}
	}
}
