package utils

import (
	"fmt"
	"math"
	"time"
)

func BeforeDate(date time.Time, now time.Time) string {
	diff := date.Sub(now).Seconds()
	if diff < 0 {
		diff = 0
	}
	seconds := int(math.Round(math.Mod(diff, 60)))
	minutes := int(math.Round(diff/60)) % 60
	hours := int(math.Round(diff/3600)) % 24
	days := int(math.Round(diff / 86400))

	if days != 0 {
		return fmt.Sprintf("%d %s", days, DeclOfNum(days, [3]string{"день", "дня", "дней"}))
	}
	if hours != 0 {
		return fmt.Sprintf("%d %s", hours, DeclOfNum(hours, [3]string{"час", "часа", "часов"}))
	}
	if minutes != 0 {
		return fmt.Sprintf("%d %s", minutes, DeclOfNum(minutes, [3]string{"минуту", "минуты", "минут"}))
	}
	return fmt.Sprintf("%d %s", seconds, DeclOfNum(seconds, [3]string{"секунду", "секунды", "секунд"}))
}
