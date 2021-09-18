import db from '../services/db';

export default async function (guild) {
	await db.query(`UPDATE server SET bot = 0 WHERE id = ?`, [guild.id]);
}
