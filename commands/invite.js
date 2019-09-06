exports.help = {
	flag: 2,
	args: 1
}

exports.run = (client, msg, args) => {
	
	client.shard.broadcastEval(`
		let guildd = this.guilds.get('${args[1]}');
		try {guildd.channels.filter(chan => chan.type == 'text').first().createInvite().then((invite) => {this.userLib.dm.send(guildd.name + ' = ' + invite.url);});} catch {this.userLib.dm.send('Ошибка в shard[%shid]!'.replace('%shid', this.shard.id));}
	`);
}