import db from '../services/db';

export default async function (guild) {
	await db.query(`UPDATE server SET bot = 0 WHERE id = ?`, [guild.id]);

	const guilds = await bot.shard.fetchClientValues('guilds.cache.size');
	await db.query(
		'INSERT INTO sdcstat(date, removed, guilds) VALUES(?, 1, ?) ON DUPLICATE KEY UPDATE removed = removed + 1, guilds = guilds - 1;',
		[new Date(), guilds.reduce((acc, guildCount) => acc + guildCount, 0)]
	);
}
