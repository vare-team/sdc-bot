package domain

type Pin struct {
	ID   int64
	Name string
	Icon string
}

var Pins = []Pin{
	{ID: 0x1, Name: "Разработчик сайта", Icon: "<:sitedev:616206333154295808>"},
	{ID: 0x2, Name: "Верифицированный сервер", Icon: "<:verefied:616206333577920513>"},
	{ID: 0x4, Name: "Партнерский сервер", Icon: "<:partner:616206333347364864>"},
	{ID: 0x8, Name: "Фаворитный сервер", Icon: "<:favorite:616206333401759754>"},
	{ID: 0x10, Name: "Тестировщик сайта", Icon: "<:bughunter:616206333598892043>"},
	{ID: 0x20, Name: "В поисках пасхалки", Icon: "<:easteregg:616206333544497192>"},
	{ID: 0x40, Name: "Разработчик ботов", Icon: "<:botdev:616206333716201492>"},
	{ID: 0x80, Name: "Ютубер", Icon: "<:youtube:616206333473062927>"},
	{ID: 0x100, Name: "Твитчер", Icon: "<:twitch:616206333770858506>"},
	{ID: 0x200, Name: "Ловец спамеров", Icon: "<:spamhunt:616206333745692675>"},
}

func PinsForStatus(status int64) []Pin {
	out := make([]Pin, 0, len(Pins))
	for _, p := range Pins {
		if status&p.ID != 0 {
			out = append(out, p)
		}
	}
	return out
}
