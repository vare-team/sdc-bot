package store

import (
	"sync"
	"time"

	"sdc/domain"
)

// CaptchaEntry holds the captcha for a guild+user pair.
// UpAt is the time of the first /up in the bump session (ranking timestamp).
// CreatedAt is armed after the captcha message is successfully sent (TTL clock).
type CaptchaEntry struct {
	Code      int
	UpAt      time.Time
	CreatedAt time.Time
}

// CaptchaStore is process-shared (safe across shards in one binary).
type CaptchaStore struct {
	mu   sync.Mutex
	data map[string]CaptchaEntry
}

func NewCaptchaStore() *CaptchaStore {
	return &CaptchaStore{data: make(map[string]CaptchaEntry)}
}

func captchaKey(guildID, userID string) string {
	return guildID + ":" + userID
}

func (c *CaptchaStore) Put(guildID, userID string, code int, upAt time.Time) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.data[captchaKey(guildID, userID)] = CaptchaEntry{
		Code: code,
		UpAt: upAt,
		// CreatedAt armed via ArmTTL after follow-up succeeds (JS parity).
	}
}

func (c *CaptchaStore) ArmTTL(guildID, userID string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	key := captchaKey(guildID, userID)
	if e, ok := c.data[key]; ok {
		e.CreatedAt = time.Now()
		c.data[key] = e
	}
}

func (c *CaptchaStore) Get(guildID, userID string) (CaptchaEntry, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	e, ok := c.data[captchaKey(guildID, userID)]
	return e, ok
}

func (c *CaptchaStore) Delete(guildID, userID string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.data, captchaKey(guildID, userID))
}

func (c *CaptchaStore) Expired(e CaptchaEntry, now time.Time) bool {
	if e.CreatedAt.IsZero() {
		return true
	}
	return now.Sub(e.CreatedAt) > domain.CaptchaTTL
}
