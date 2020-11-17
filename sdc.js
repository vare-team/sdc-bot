const { Client } = require('discord.js');

const bot = new Client({
	messageCacheMaxSize: 5,
	messageCacheLifetime: 10,
	messageEditHistoryMaxSize: 0,
	messageSweepInterval: 10
});

bot.on('ready', require('./events/ready')(bot));
bot.on('message', require('./events/message')());

bot.on('guildCreate', () => {
	//
});

bot.on('guildUpdate', () => {
	//
});

bot.on('guildDelete', () => {
	//
});

bot.login();
