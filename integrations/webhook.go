package integrations

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/bwmarrin/discordgo"

	"sdc/utils"
)

type Webhook struct {
	url     string
	enabled bool
	client  *http.Client
	once    sync.Once
}

func NewWebhook(url string) *Webhook {
	url = strings.TrimSpace(url)
	if url == "" {
		utils.Log("WEBHOOK_URL not set — webhook sends disabled")
		return &Webhook{enabled: false}
	}
	return &Webhook{
		url:     url,
		enabled: true,
		client:  &http.Client{Timeout: 10 * time.Second},
	}
}

func (w *Webhook) SendEmbed(embed *discordgo.MessageEmbed) error {
	if w == nil || !w.enabled {
		if w != nil {
			w.once.Do(func() {
				utils.Log("webhook skip: WEBHOOK_URL not configured")
			})
		}
		return nil
	}
	body, err := json.Marshal(map[string]interface{}{
		"embeds": []*discordgo.MessageEmbed{embed},
	})
	if err != nil {
		return err
	}
	resp, err := w.client.Post(w.url, "application/json", bytes.NewReader(body))
	if err != nil {
		return err
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= 300 {
		return fmt.Errorf("webhook status %d", resp.StatusCode)
	}
	return nil
}
