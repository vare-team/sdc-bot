import { CronJob } from 'cron';
import db from '../services/db.js';
import log from '../utils/log.js';

export const sync = new CronJob('0 0 * * * *', async () => {
	log('Cron: sync start!');

	const guilds = (await bot.shard.broadcastEval(() => [...this.guilds.cache.keys()])).flat(1);

	db.query('UPDATE guilds SET is_bot = 0 WHERE id NOT IN (?) and is_bot = 1', [guilds]);
	db.query('UPDATE guilds SET is_bot = 1 WHERE id IN (?) and is_bot = 0', [guilds]);

	const inDB = await db.many('SELECT id FROM guilds WHERE id IN (?)', [guilds]);
	const notInDB = guilds.filter(guild => !inDB.find(g => g.id === guild));
	console.log('not in db:', notInDB);

	log('Cron: sync end!');
});
