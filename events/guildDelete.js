import db from '../services/db';
import metric from '../services/metric.js';

export default async function (guild) {
	await db.query(`UPDATE guilds SET is_bot = 0 WHERE id = ?`, [guild.id]);

	const guilds = await bot.shard.fetchClientValues('guilds.cache.size');
	const allGuilds = guilds.reduce((acc, guild) => acc + guild, 0);
	await metric('/sdc/removed', allGuilds);
}
