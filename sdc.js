import { Client, Intents } from 'discord.js';
import readyEvent from './events/ready';
import log from './utils/log';

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
global.bot = bot;

bot.on('ready', readyEvent);

bot.login().then(() => log('Bot Authorized'));
