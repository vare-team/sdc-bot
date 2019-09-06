module.exports = (client) => {
	require('http').createServer().listen(1501 + client.shard.id);
	setInterval(client.userLib.presenseFunc, 30000);
	client.userLib.sendlog(`{READY}`);
};