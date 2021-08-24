const { Client, Intents } = require('discord.js');

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

bot.on('ready', require('./events/ready')(bot));
bot.on('messageCreate', require('./events/message')());
bot.on('interactionCreate', require('./events/interactionCreate')());

bot.login().then(() => console.log('Bot Authorized'));
