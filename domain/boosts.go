package domain

var BoostNames = []string{"", "Light", "Pro", "Max"}

func BoostName(level int) string {
	if level <= 0 || level >= len(BoostNames) {
		return ""
	}
	return BoostNames[level]
}
