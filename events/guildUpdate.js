import db from '../services/db';

export default async function (oldG, newG) {
	if (!newG.available || (oldG.icon === newG.icon && oldG.name === newG.name && oldG.ownerId === newG.ownerId)) return;

	const member = await newG.fetchOwner();
	await db.query(
		'INSERT INTO users (id, username, avatar, created_at, updated_at) VALUES (?, ?, ?, now(), now()) ON DUPLICATE KEY UPDATE username = ?, avatar = ?, updated_at = now()',
		[member.user.id, member.user.username, member.user.avatar, member.user.username, member.user.avatar]
	);
	await db.query(`UPDATE guilds SET name = ?, icon = ?, members = ?, user_id = ? WHERE id = ?`, [
		newG.name,
		newG.icon,
		newG.memberCount,
		newG.ownerId,
		newG.id,
	]);
}
