exports.help = {
	flag: 1,
	args: 0
}

exports.run = async (client, msg) => {
	msg.channel.startTyping();

	let res = await client.shard.broadcastEval(`[ ...this.guilds.keys() ]`);
	let temp = [];
	for (var i = 0, length = client.shard.count; i < length; i++) temp.push(...res[i]);
	res = temp;

	res.splice(res.indexOf('577798137230655508'), 1);

	await client.userLib.db.queryCol(`SELECT id FROM server WHERE id IN (?) AND bot = 0`, [res], (err, result) => {
		client.userLib.db.query(`UPDATE server SET bot = 1 WHERE id IN (?)`, [result], () => {});
	}); 

	await client.userLib.db.queryCol('SELECT id FROM server WHERE bot = 1', (err, result) => {
		client.userLib.db.query(`UPDATE server SET bot = 0 WHERE id IN (?)`, [result.filter(item => res.indexOf(item) == -1)], () => {});
	});

	await client.userLib.db.queryCol(`SELECT id FROM server WHERE id IN (?)`, [res], async (err, result) => {
		result = res.filter(item => result.indexOf(item) == -1);
		let temp = '';
		console.log(result);
		for (var i in result) {
			temp += 'no in db: ' + result[i] + ' ' + (await client.shard.broadcastEval(`this.guilds.get('${result[i]}') ? this.guilds.get('${result[i]}').name : 0`)).find(i => i) + '\n';
		}
		msg.channel.send(temp).catch(() => msg.channel.send('Серверов нет'));
	});

	msg.channel.stopTyping();
}