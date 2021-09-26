import db from '../services/db';

export default async function (guild, newGuild) {
	if (!newGuild.available || (guild.icon === newGuild.icon && guild.name === newGuild.name && guild.ownerId === newGuild.ownerId)) return;

	await db.query(`UPDATE server SET name = ?, avatar = ?, members = ?, ownerID = ? WHERE id = ?`, [
		newGuild.name,
		newGuild.icon ?? '/img/Logo.svg',
		newGuild.memberCount,
		newGuild.ownerId,
		newGuild.id,
	]);
}
