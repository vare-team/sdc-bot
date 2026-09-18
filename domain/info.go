package domain

import "time"

type GuildInfo struct {
	UpCount    int64
	Boost      int
	BoostEndAt *time.Time
	Status     int64
	Place      int64
	Rating     int64
	Comments   int64
}

// NextSeasonEnd returns the next SDC season boundary (1st or 15th at 12:00 UTC+3).
func NextSeasonEnd(now time.Time) time.Time {
	const offsetHours = 3
	local := now.UTC().Add(offsetHours * time.Hour)
	day := local.Day()
	hour := local.Hour()

	useFirst := day > 15 || (day == 15 && hour > 12-offsetHours) || (day == 1 && hour < 12-offsetHours)
	month := local.Month()
	year := local.Year()
	if day > 15 || (day == 15 && hour > 12-offsetHours) {
		month++
		if month > 12 {
			month = 1
			year++
		}
	}

	targetDay := 15
	if useFirst {
		targetDay = 1
	}

	// 12:00 at UTC+3 == 09:00 UTC
	return time.Date(year, month, targetDay, 12-offsetHours, 0, 0, 0, time.UTC)
}
