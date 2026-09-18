package service

import "math/rand"

func RandomInt(min int, max int) float64 {
	return float64(rand.Intn(max-min+1) + min)
}

func RandomIntInclusive(min, max int) int {
	return rand.Intn(max-min+1) + min
}
