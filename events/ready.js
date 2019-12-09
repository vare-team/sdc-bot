module.exports = (client) => {
	require('http').createServer().listen(1501 + client.shard.id);
	setInterval(client.userLib.presenseFunc, 30000);
	if (client.shard.id === 0) {
		client.userLib.db.queryKeyValue('SELECT userId, avatar FROM users', (err, result)=>{
			if (err) throw err;
			let upd = 0;
			for (var i in result) {
				let user = client.users.get(i);
				if (user) {
					upd++;
					client.userLib.db.update('users', {userId: i, username: user.username + '#' + user.discriminator, avatar: user.avatar}, () => {});
				}
			}
			console.log(upd, '/', Object.keys(result).length);
		});
	}
	client.userLib.sendlog(`{READY}`);
};