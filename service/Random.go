package service

import (
	"math/rand"
	"time"
)

func RandomInt(min int, max int) float64 {
	rand.Seed(time.Now().UnixNano())
	return float64(rand.Intn(max-min+1) + min)
}

func RandomString(count int, sand string) string {
	b := make([]byte, count)
	for i := range b {
		b[i] = sand[rand.Intn(len(sand))]
	}
	return string(b)
}
