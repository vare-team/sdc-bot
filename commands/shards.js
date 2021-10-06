import { MessageEmbed } from 'discord.js';
import colors from '../models/colors';
import shardNames from '../models/shardNames';

const sum = values => values.reduce((p, v) => p + v, 0);

export const helpers = {
	ephemeral: true,
};

export async function run(interaction) {
	const embed = new MessageEmbed()
		.setAuthor(bot.user.username, bot.user.avatarURL(), 'https://server-discord.com')
		.setFooter(`Шард сервера: ${shardNames[bot.shard.ids[0]]}`)
		.setColor(colors.blue);

	const [guilds, pings, memory] = await Promise.all([
		bot.shard.fetchClientValues('guilds.cache.size'),
		bot.shard.broadcastEval(c => c.ws.ping.toFixed(0)),
		bot.shard.broadcastEval(() => +(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)),
	]);

	for (let i = 0, length = bot.shard.count; i < length; i++) {
		embed.addField(
			`${i + 1}. ${shardNames[i]} ${i === bot.shard.ids[0] ? '←' : ''}`,
			`Серверов: \`${guilds[i]}\`, Пинг: \`${pings[i]} мс\`, ОЗУ: \`${memory[i]} МБ\``
		);
	}

	embed.addField('​', '​');
	embed.addField(`Всего: ${bot.shard.count}`, `Серверов: \`${sum(guilds)}\`, ОЗУ: \`${sum(memory).toFixed(2)} МБ\``);

	await interaction.editReply({ embeds: [embed], ephemeral: interaction.options.getBoolean('ephemeral') ?? true });
}

export default {
	helpers,
	run,
};
