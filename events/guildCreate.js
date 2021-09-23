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
}
