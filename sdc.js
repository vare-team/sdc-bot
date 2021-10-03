import { Client, Intents, Options } from 'discord.js';
import readyEvent from './events/ready';
import log from './utils/log';
import changePresence from './utils/changePresence';

const bot = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
	makeCache: Options.cacheWithLimits({
		MessageManager: { maxSize: 0 },
		ThreadManager: { maxSize: 0 },
		UserManager: { maxSize: 0 },
		GuildMemberManager: { maxSize: 0 },
		GuildBanManager: { maxSize: 0 },
	}),
});

global.bot = bot;

bot.on('ready', readyEvent);

bot.login().then(() => {
	log('Bot Authorized');
	setInterval(changePresence, 30000);
});
