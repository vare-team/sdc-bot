import db from '../services/db';

export default async function (oldG, newG) {
	if (!newG.available || (oldG.icon === newG.icon && oldG.name === newG.name && oldG.ownerId === newG.ownerId)) return;

	await db.query(`UPDATE guilds SET name = ?, icon = ?, members = ?, user_id = ? WHERE id = ?`, [
		newG.name,
		newG.icon,
		newG.memberCount,
		newG.ownerId,
		newG.id,
	]);
}
