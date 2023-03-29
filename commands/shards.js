import { EmbedBuilder } from 'discord.js';
import colors from '../models/colors';
import shardNames from '../models/shardNames';

const sum = values => values.reduce((p, v) => p + v, 0);

export const helpers = {
	ephemeral: true,
};

export async function run(interaction) {
	const client = interaction.client;
	const embed = new EmbedBuilder()
		.setAuthor({
			name: client.user.username,
			iconURL: client.user.avatarURL(),
			url: 'https://server-discord.com',
		})
		.setFooter({ text: `Шард сервера: ${shardNames[client.shard.ids[0]]}` })
		.setColor(colors.blue);

	const [guilds, pings, memory] = await Promise.all([
		client.shard.fetchClientValues('guilds.cache.size'),
		client.shard.broadcastEval(c => c.ws.ping.toFixed(0)),
		client.shard.broadcastEval(() => +(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)),
	]);

	const fields = [];
	for (let i = 0, length = client.shard.count; i < length; i++) {
		fields.push({
			name: `${i + 1}. ${shardNames[i]} ${i === client.shard.ids[0] ? '←' : ''}`,
			value: `Серверов: \`${guilds[i]}\`, Пинг: \`${pings[i]} мс\`, ОЗУ: \`${memory[i]} МБ\``,
		});
	}

	fields.push(
		{ name: '​', value: '​' },
		{ name: 'Всего', value: `Серверов: \`${sum(guilds)}\`, ОЗУ: \`${sum(memory).toFixed(2)} МБ\`` }
	);

	embed.addFields(fields);
	await interaction.editReply({ embeds: [embed], ephemeral: interaction.options.getBoolean('ephemeral') ?? true });
}

export default {
	helpers,
	run,
};
