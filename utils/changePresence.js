import { ActivityType } from 'discord.js';

let presence = 1;

/**
 *
 * @param client {Client}
 * @return {Promise<void>}
 */
export default async function (client) {
	if (presence === 1) {
		const guilds = await client.shard.fetchClientValues('guilds.cache.size');
		client.user.setActivity(`серверов: ${guilds.reduce((p, v) => p + v, 0)} | /up`, { type: ActivityType.Watching });
	} else if (presence === 2) {
		client.user.setActivity('/up | /info', { type: ActivityType.Listening });
	} else if (presence === 3) {
		client.user.setActivity('Апнуть сервер - /up', { type: ActivityType.Listening });
		presence = 0;
	}

	presence++;
}
