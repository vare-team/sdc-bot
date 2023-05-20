import db from '../services/db';

export default async function (guild) {
	const inDB = await db.one('SELECT id FROM guilds WHERE id = ?', [guild.id]);
	if (!inDB) {
		await guild.leave();
		return;
	}

	const member = await guild.fetchOwner();
	await db.query(
		'INSERT INTO users (id, username, avatar, created_at, updated_at) VALUES (?, ?, ?, now(), now()) ON DUPLICATE KEY UPDATE username = ?, avatar = ?, updated_at = now()',
		[member.user.id, member.user.username, member.user.avatar, member.user.username, member.user.avatar]
	);
	await db.query('UPDATE guilds SET is_bot = 1, members = ?, user_id = ? WHERE id = ?', [
		guild.memberCount,
		guild.ownerId,
		guild.id,
	]);

	// todo add db and api for metric
	// const guilds = await bot.shard.fetchClientValues('guilds.cache.size');
	// const allGuilds = guilds.reduce((acc, guild) => acc + guild, 0);
	// await db.query(
	// 	'INSERT INTO sdcstat(date, added, guilds) VALUES(?, 1, ?) ON DUPLICATE KEY UPDATE added = added + 1, guilds = ?;',
	// 	[new Date(), allGuilds, allGuilds]
	// );
}
