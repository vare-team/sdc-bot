import { ShardingManager } from 'discord.js';
import log from './utils/log';

const shardManager = new ShardingManager('./sdc.js', { mode: 'worker', token: process.env.TOKEN });

shardManager.on('shardCreate', shard => log(`Shard spawned!`, shard.id));

(async () => {
	await shardManager.spawn();
})();
