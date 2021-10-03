let presence = 1;

export default async function () {
	if (presence === 1) {
		const guilds = await bot.shard.fetchClientValues('guilds.cache.size');
		bot.user.setActivity(`серверов: ${guilds.reduce((p, v) => p + v, 0)} | /UP`, { type: 'WATCHING' });
	} else if (presence === 2) {
		bot.user.setActivity('/up | /info', { type: 'LISTENING' });
	} else if (presence === 3) {
		bot.user.setActivity('Апнуть сервер - /up', { type: 'LISTENING' });
		presence = 0;
	}

	presence++;
}
