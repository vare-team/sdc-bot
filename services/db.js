import mariadb from 'mariadb';

const db = mariadb.createPool({
	user: process.env.DBLOGIN,
	password: process.env.DBPASS,
	host: process.env.DBHOST,
	database: process.env.DBNAME,
	charset: 'utf8mb4',
	multipleStatements: true,
});

export default {
	query: db.query.bind(db),

	many(...args) {
		return db.query(...args);
	},

	async one(...args) {
		const query = await db.query(...args);
		return query[0];
	},

	async oneMulti(...args) {
		const query = await db.query(...args);
		return query[1][0];
	},
};
