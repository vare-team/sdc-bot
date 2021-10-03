import log from '../utils/log';
import changePresence from '../utils/changePresence';
import messageEvent from './message';
import guildCreateEvent from './guildCreate';
import guildUpdateEvent from './guildUpdate';
import guildDeleteEvent from './guildDelete';
import interactionCreateEvent from './interactionCreate';

export default function () {
	setInterval(changePresence, 30000);

	bot.on('messageCreate', messageEvent);

	bot.on('interactionCreate', interactionCreateEvent);

	bot.on('guildCreate', guildCreateEvent);
	bot.on('guildUpdate', guildUpdateEvent);
	bot.on('guildDelete', guildDeleteEvent);

	log('Shard is ready!');
}
