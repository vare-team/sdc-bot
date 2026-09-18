package utils

func DeclOfNum(n int, titles [3]string) string {
	cases := []int{2, 0, 1, 1, 1, 2}
	if n%100 > 4 && n%100 < 20 {
		return titles[2]
	}
	idx := n % 10
	if idx >= 5 {
		idx = 5
	}
	return titles[cases[idx]]
}
