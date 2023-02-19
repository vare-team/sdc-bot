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
	await db.query(
		'INSERT INTO sdcstat(date, added, guilds) VALUES(?, 1, ?) ON DUPLICATE KEY UPDATE added = added + 1, guilds = guilds + 1;',
		[new Date(), guilds.reduce((acc, guildCount) => acc + guildCount, 0)]
	);
}
