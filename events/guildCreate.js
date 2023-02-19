import db from '../services/db';

export default async function (guild) {
	const inDB = await db.one('SELECT id FROM server WHERE id = ?', [guild.id]);
	if (!inDB) {
		await guild.leave();
		return;
	}

	await db.query('UPDATE server SET bot = 1, members = ?, ownerID = ? WHERE id = ?', [
		guild.memberCount,
		guild.ownerId,
		guild.id,
	]);
	const guilds = await bot.shard.fetchClientValues('guilds.cache.size');
	const allGuilds = guilds.reduce((acc, guild) => acc + guild, 0);
	await db.query(
		'INSERT INTO sdcstat(date, added, guilds) VALUES(?, 1, ?) ON DUPLICATE KEY UPDATE added = added + 1, guilds = ?;',
		[new Date(), allGuilds, allGuilds]
	);
}
