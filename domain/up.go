package domain

// UpDelta returns points added on a successful bump.
// Formula: 1 (base) + boost tier + 1 if favorite.
func UpDelta(status int64, boost int) int64 {
	delta := int64(1 + boost)
	if status&FavoriteStatusBit != 0 {
		delta++
	}
	return delta
}
