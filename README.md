# SDC Bot (Go)

Discord-бот [server-discord.com](https://server-discord.com/) — ап серверов на мониторинге.

Замена JS-бота (`discord.js`) на Go (`discordgo`).

## Run

```bash
cp .env.example .env
# fill DISCORD_TOKEN, DB*, optional WEBHOOK_URL, METRIC_API_URL, DEV_GUILD_ID
go run .
```

`DEV_GUILD_ID` — регистрация slash-команд только в этой гильдии (dev). Пусто = global.

## Layout

- `bot/` — шарды, thin guild cache, auto-respawn, slash registration
- `commands/` — `/up` `/info` `/link` `/shards` `/remove`
- `events/` — InteractionCreate, GuildCreate/Delete/Update
- `domain/` — бизнес-правила (UP delta, pins, season)
- `store/` — MariaDB + shared captcha store
- `integrations/` — webhook, metrics
- `jobs/` — hourly is_bot sync, presence rotation
