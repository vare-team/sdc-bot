import mysql2 from 'mysql2';

const db = mysql2.createPool({
	user: process.env.DBLOGIN,
	password: process.env.DBPASS,
	host: process.env.DBHOST,
	database: process.env.DBNAME,
	charset: 'utf8mb4',
	multipleStatements: true,
});

export default {
	query: db.promise().query.bind(db.promise()),

	async many(...args) {
		const query = await db.promise().query(...args);
		return query[0];
	},

	async one(...args) {
		const query = await db.promise().query(...args);
		return query[0][0];
	},

	async oneMulti(...args) {
		const query = await db.promise().query(...args);
		console.log(query[0][1]);
		return query[0][1][0];
	},
};
