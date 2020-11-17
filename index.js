const { ShardingManager } = require('discord.js');
const dateUtil = require('./utils/date');
const shardManager = new ShardingManager('./sdc.js', { mode: 'worker', token: process.env.TOKEN });

shardManager.on('shardCreate', (shard) => {
	console.log(`${dateUtil(new Date())} | Shard[${shard.id}] shard spawned!`);
});

shardManager.on('message', (shard, message) => {
	console.log(`${dateUtil(new Date())} | Shard[${shard.id}] : ${message._eval} : ${message._result}`);
});

(async () => {
	let shards = await shardManager.spawn();
})()
