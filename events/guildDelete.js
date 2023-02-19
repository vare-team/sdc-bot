import db from '../services/db';

export default async function (guild) {
	await db.query(`UPDATE server SET bot = 0 WHERE id = ?`, [guild.id]);

	const guilds = await bot.shard.fetchClientValues('guilds.cache.size');
	const allGuilds = guilds.reduce((acc, guild) => acc + guild, 0);
	await db.query(
		'INSERT INTO sdcstat(date, removed, guilds) VALUES(?, 1, ?) ON DUPLICATE KEY UPDATE removed = removed + 1, guilds = ?;',
		[new Date(), allGuilds, allGuilds]
	);
}
