exports.help = {
	flag: 1,
	args: 1
}

exports.run = async (client, msg, args) => {

	let shards = await client.shard.broadcastEval(`this.guilds.get('${args[1]}') ? this.shard.id : -1`);

	// let shards.forEach()

	msg.reply(shards);

}