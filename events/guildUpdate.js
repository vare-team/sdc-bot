import db from '../services/db';

export default async function (oldG, newG) {
	if (!newG.available || (oldG.icon === newG.icon && oldG.name === newG.name && oldG.ownerId === newG.ownerId)) return;

	await db.query(`UPDATE server SET name = ?, avatar = ?, members = ?, ownerID = ? WHERE id = ?`, [
		newG.name,
		newG.icon ?? '/img/Logo.svg',
		newG.memberCount,
		newG.ownerId,
		newG.id,
	]);
}
