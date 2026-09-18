package integrations

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"sdc/utils"
)

type Metrics struct {
	baseURL string
	enabled bool
	client  *http.Client
	once    sync.Once
}

func NewMetrics(baseURL string) *Metrics {
	baseURL = strings.TrimSpace(baseURL)
	if baseURL == "" {
		utils.Log("METRIC_API_URL not set — metrics sends disabled")
		return &Metrics{enabled: false}
	}
	return &Metrics{
		baseURL: strings.TrimRight(baseURL, "/"),
		enabled: true,
		client:  &http.Client{Timeout: 5 * time.Second},
	}
}

func (m *Metrics) Post(path string, guilds interface{}) error {
	if m == nil || !m.enabled {
		if m != nil {
			m.once.Do(func() {
				utils.Log("metrics skip: METRIC_API_URL not configured")
			})
		}
		return nil
	}
	body, err := json.Marshal(map[string]interface{}{"guilds": guilds})
	if err != nil {
		return err
	}
	resp, err := m.client.Post(m.baseURL+path, "application/json", bytes.NewReader(body))
	if err != nil {
		return err
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= 300 {
		return fmt.Errorf("metrics %s status %d", path, resp.StatusCode)
	}
	return nil
}
