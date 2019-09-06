exports.help = {
	flag: 1,
	args: 0
}

exports.run = (client, msg, args) => {

	for (var i = 0; i < client.shard.count; i++) {
		console.log(i);
		setTimeout(() => client.shard.broadcastEval(`((i) => {if (this.shard.id === ' + i + ') process.exit();})(${i})`), (i + 1) * 1000);
	}
	
	msg.reply('Шарды отправлены на миграцию!');

}