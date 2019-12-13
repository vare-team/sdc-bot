const Discord = require('discord.js')
		,	client = new Discord.Client({messageCacheMaxSize: 1, messageCacheLifetime: 1, messageSweepInterval: 1, fetchAllMembers: false})
		,	fs = require("fs")
		;

let con = require('mysql2').createConnection({user: process.env.dblogin, password: process.env.dbpass, host: process.env.dbhost, database: "discord", charset: "utf8mb4"});
con.on('error', (err) => {console.warn(err)});
con.connect(() => {client.userLib.sendlog(`{DB Connected} (ID:${con.threadId})`);});
let util = require('mysql-utilities');
util.upgrade(con);
util.introspection(con);

client.userLib = {};

client.userLib.shardName = require('./shards_name.json').name;

client.userLib.moment = require('moment');
client.userLib.moment.locale('ru');

client.userLib.discord = Discord;
client.userLib.db = con;
client.userLib.promise = require('../SDCBotsModules/promise');
client.userLib.presenseCount = 1;
client.userLib.cooldown = new Set();

client.userLib.logc = new Discord.WebhookClient("578236376361730068", "Avm2Uy4KTi4L6I3GrCiwXo0SxhSE-4cCp0c6PUUDfjmlLQlANpws9ioFVXBn9_TQOrak");
client.userLib.dm = new Discord.WebhookClient("586110798032797709", "kt6uWTbTELlMkjJ8tbwDSq_m54zfi6tTSAAlNl6njQRKLpvjnlV39j2tGn42lzT_h6Yr");
client.userLib.command = new Discord.WebhookClient("631960716894535682", "zROVA3TmqMY2YPmBZso6ko6rkU9foqnLXtm8XZWx_Kp47t7qVYtKI-53CDRJVAuOBwzA");

client.userLib.sendlog = (log) => {
	const now = new Date();
	console.log(`${('00' + now.getHours()).slice(-2) + ':' + ('00' + now.getMinutes()).slice(-2) + ':' + ('00' + now.getSeconds()).slice(-2)} | Shard[${client.shard.id}] : ${log}`);
};

client.userLib.presenseFunc = () => {
	switch (client.userLib.presenseCount) {
		case 1:
			client.shard.fetchClientValues('guilds.size').then(results => {client.user.setPresence({ game: { name: `серверов: ${results.reduce((prev, val) => prev + val, 0) - 1} | s.help`, type: 'WATCHING' }});});
			break;
		case 2:
			client.user.setPresence({ game: { name: `s.help | s.info | s.up`, type: 'LISTENING' }});
			break;
		case 3:
			client.user.setPresence({ game: { name: `Серверов на ${client.userLib.shardName[client.shard.id]}: ${client.guilds.size}`, type: 'LISTENING' }});
			client.userLib.presenseCount = 0;
			break;
	}

	client.userLib.presenseCount++;
};

con.queryKeyValue('SELECT id, tier FROM admins WHERE 1', (err, result) => client.userLib.admins = result );
con.query('SELECT idach, emoji FROM achivments', (err, result) => client.userLib.emojis = result );

fs.readdir("./events/", (err, files) => {
	if (err) return console.error(err);
	files.filter(l => l.endsWith('.js')).forEach(file => {
		try {
			const event = require(`./events/${file}`);
			let eventName = file.split(".")[0];
			client.on(eventName, event.bind(null, client));
			delete require.cache[require.resolve(`./events/${file}`)];
		} catch (e) {console.warn(e)}
	});
});

client.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
	if (err) return console.error(err);
	files.filter(l => l.endsWith('.js')).forEach(file => {
		try {
			let props = require(`./commands/${file}`);
			let commandName = file.split(".")[0];
			client.commands.set(commandName, props);
		} catch (e) {console.warn(e)}
	});
});

client.login(process.env.token);