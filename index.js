import { ShardingManager, fetchRecommendedShardCount } from 'discord.js';
import log from './utils/log';

const shardManager = new ShardingManager('./sdc.js', {
	token: process.env.TOKEN,
	execArgv: ['--unhandled-rejections=warn', '--experimental-specifier-resolution=node'],
});

shardManager.on('shardCreate', shard => log(`Shard spawned!`, shard.id));

(async () => {
	const amount = await fetchRecommendedShardCount(process.env.TOKEN, {
		guildsPerShard: 1000,
	});
	log(`Shards count: ${amount}`, 'null');

	const shards = await shardManager.spawn({ amount });
	for (const [, shard] of shards) shard.process.send('startPresence');
})();
