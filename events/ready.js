import log from '../utils/log';
import guildCreateEvent from './guildCreate';
import guildUpdateEvent from './guildUpdate';
import guildDeleteEvent from './guildDelete';
import interactionCreateEvent from './interactionCreate';

/**
 * @param {Client} client
 */
export default function (client) {
	client.on('interactionCreate', interactionCreateEvent);

	client.on('guildCreate', guildCreateEvent);
	client.on('guildUpdate', guildUpdateEvent);
	client.on('guildDelete', guildDeleteEvent);

	log('Shard is ready!');
}
