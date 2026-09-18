package domain

import "testing"

func TestUpDelta(t *testing.T) {
	tests := []struct {
		status int64
		boost  int
		want   int64
	}{
		{0, 0, 1},
		{FavoriteStatusBit, 0, 2},
		{0, 3, 4},
		{FavoriteStatusBit, 3, 5},
	}
	for _, tt := range tests {
		if got := UpDelta(tt.status, tt.boost); got != tt.want {
			t.Fatalf("UpDelta(%d,%d)=%d want %d", tt.status, tt.boost, got, tt.want)
		}
	}
}
