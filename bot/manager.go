package bot

import (
	"context"
	"fmt"
	"math/rand"
	"runtime"
	"sync"
	"time"

	"github.com/bwmarrin/discordgo"

	"sdc/config"
	"sdc/integrations"
	"sdc/store"
	"sdc/utils"
)

type Manager struct {
	Cfg     config.Config
	Store   *store.Store
	Cache   *GuildCache
	Captcha *store.CaptchaStore
	Webhook *integrations.Webhook
	Metrics *integrations.Metrics

	mu        sync.RWMutex
	sessions  map[int]*discordgo.Session
	shardStat map[int]*ShardStat
	total     int
	cancel    context.CancelFunc
	wg        sync.WaitGroup
}

type ShardStat struct {
	Ping    float64
	Ready   bool
	ShardID int
}

func NewManager(cfg config.Config, st *store.Store) *Manager {
	return &Manager{
		Cfg:       cfg,
		Store:     st,
		Cache:     NewGuildCache(),
		Captcha:   store.NewCaptchaStore(),
		Webhook:   integrations.NewWebhook(cfg.WebhookURL),
		Metrics:   integrations.NewMetrics(cfg.MetricAPIURL),
		sessions:  make(map[int]*discordgo.Session),
		shardStat: make(map[int]*ShardStat),
	}
}

func (m *Manager) Start(ctx context.Context) error {
	ctx, m.cancel = context.WithCancel(ctx)

	gateway, err := m.fetchGatewayBot()
	if err != nil {
		return err
	}

	shards := gateway.Shards
	if shards < 1 {
		shards = 1
	}
	concurrency := gateway.SessionStartLimit.MaxConcurrency
	if concurrency < 1 {
		concurrency = 1
	}
	m.total = shards
	utils.Log("Gateway recommended shards=%d max_concurrency=%d", shards, concurrency)

	for bucketStart := 0; bucketStart < shards; bucketStart += concurrency {
		bucketEnd := bucketStart + concurrency
		if bucketEnd > shards {
			bucketEnd = shards
		}
		var wg sync.WaitGroup
		for id := bucketStart; id < bucketEnd; id++ {
			wg.Add(1)
			go func(shardID int) {
				defer wg.Done()
				if err := m.startShard(ctx, shardID, shards); err != nil {
					utils.Log("shard %d initial start failed: %v", shardID, err)
				}
			}(id)
		}
		wg.Wait()
		if bucketEnd < shards {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(5 * time.Second):
			}
		}
	}

	if err := m.RegisterCommands(); err != nil {
		utils.Log("slash registration warning: %v", err)
	}

	return nil
}

func (m *Manager) fetchGatewayBot() (*discordgo.GatewayBotResponse, error) {
	s, err := discordgo.New("Bot " + m.Cfg.DiscordToken)
	if err != nil {
		return nil, err
	}
	defer func() { _ = s.Close() }()
	return s.GatewayBot()
}

func (m *Manager) startShard(ctx context.Context, shardID, shardCount int) error {
	s, err := discordgo.New("Bot " + m.Cfg.DiscordToken)
	if err != nil {
		return err
	}
	s.ShardID = shardID
	s.ShardCount = shardCount
	s.Identify.Intents = discordgo.IntentsGuilds
	s.StateEnabled = true
	s.State.MaxMessageCount = 0
	s.State.TrackChannels = false
	s.State.TrackEmojis = false
	s.State.TrackMembers = false
	s.State.TrackRoles = false
	s.State.TrackVoice = false
	s.State.TrackPresences = false
	s.State.TrackThreads = false
	s.State.TrackThreadMembers = false

	m.bindHandlers(s)

	if err := s.Open(); err != nil {
		_ = s.Close()
		return fmt.Errorf("open shard %d: %w", shardID, err)
	}

	m.mu.Lock()
	m.sessions[shardID] = s
	m.shardStat[shardID] = &ShardStat{ShardID: shardID, Ready: true}
	m.mu.Unlock()

	utils.Log("Shard %d/%d connected", shardID+1, shardCount)

	m.wg.Add(1)
	go m.watchShard(ctx, shardID, shardCount, s)
	return nil
}

func (m *Manager) watchShard(ctx context.Context, shardID, shardCount int, s *discordgo.Session) {
	defer m.wg.Done()

	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	downFor := 0
	const downLimit = 20 // ~60s without DataReady → respawn

	for {
		select {
		case <-ctx.Done():
			_ = s.Close()
			return
		case <-ticker.C:
			m.mu.Lock()
			if st, ok := m.shardStat[shardID]; ok {
				st.Ping = s.HeartbeatLatency().Seconds() * 1000
				st.Ready = s.DataReady
			}
			m.mu.Unlock()

			if s.DataReady {
				downFor = 0
				continue
			}
			downFor++
			if downFor < downLimit {
				continue
			}

			utils.Log("Shard %d unhealthy for ~%ds, respawning", shardID, downFor*3)
			_ = s.Close()
			m.mu.Lock()
			delete(m.sessions, shardID)
			if st, ok := m.shardStat[shardID]; ok {
				st.Ready = false
			}
			m.mu.Unlock()

			m.respawnLoop(ctx, shardID, shardCount)
			return
		}
	}
}

func (m *Manager) respawnLoop(ctx context.Context, shardID, shardCount int) {
	attempt := 0
	for {
		select {
		case <-ctx.Done():
			return
		default:
		}
		attempt++
		backoff := time.Duration(attempt) * time.Second
		if backoff > 60*time.Second {
			backoff = 60 * time.Second
		}
		jitter := time.Duration(rand.Intn(500)) * time.Millisecond
		utils.Log("Shard %d respawn attempt %d in %s", shardID, attempt, backoff+jitter)
		select {
		case <-ctx.Done():
			return
		case <-time.After(backoff + jitter):
		}

		if err := m.startShard(ctx, shardID, shardCount); err != nil {
			utils.Log("Shard %d respawn failed: %v", shardID, err)
			continue
		}
		utils.Log("Shard %d respawned", shardID)
		return
	}
}

func (m *Manager) Stop() {
	if m.cancel != nil {
		m.cancel()
	}
	m.mu.Lock()
	for id, s := range m.sessions {
		_ = s.Close()
		delete(m.sessions, id)
	}
	m.mu.Unlock()
	m.wg.Wait()
}

func (m *Manager) Session(shardID int) *discordgo.Session {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.sessions[shardID]
}

func (m *Manager) AnySession() *discordgo.Session {
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, s := range m.sessions {
		return s
	}
	return nil
}

func (m *Manager) BotName() string {
	s := m.AnySession()
	if s == nil {
		return "unknown"
	}
	if s.State != nil && s.State.User != nil && s.State.User.Username != "" {
		return s.State.User.Username
	}
	u, err := s.User("@me")
	if err != nil || u == nil {
		return "unknown"
	}
	return u.Username
}

func (m *Manager) Sessions() []*discordgo.Session {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]*discordgo.Session, 0, len(m.sessions))
	for _, s := range m.sessions {
		out = append(out, s)
	}
	return out
}

func (m *Manager) ShardCount() int {
	return m.total
}

func (m *Manager) TotalGuilds() int {
	return m.Cache.Count()
}

type ShardSnapshot struct {
	ID     int
	Guilds int
	PingMS int
	HeapMB float64
	Ready  bool
}

func (m *Manager) ShardSnapshots() []ShardSnapshot {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]ShardSnapshot, m.total)
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)
	heapAll := float64(mem.HeapInuse) / 1024 / 1024
	per := heapAll
	if m.total > 0 {
		per = heapAll / float64(m.total)
	}
	for i := 0; i < m.total; i++ {
		st := m.shardStat[i]
		ping := 0.0
		ready := false
		if st != nil {
			ping = st.Ping
			ready = st.Ready
		}
		out[i] = ShardSnapshot{
			ID:     i,
			Guilds: m.Cache.CountOnShard(i),
			PingMS: int(ping),
			HeapMB: per,
			Ready:  ready,
		}
	}
	return out
}
