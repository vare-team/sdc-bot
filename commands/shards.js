import { EmbedBuilder, inlineCode } from 'discord.js';
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

	let description = '';
	for (let i = 0, length = client.shard.count; i < length; i++) {
		description +=
			`${i + 1}. ${shardNames[i]} ${i === client.shard.ids[0] ? '←' : ''}\n` +
			`Серверов: ${inlineCode(guilds[i])}, Пинг: ${inlineCode(pings[i])} мс, ОЗУ: ${inlineCode(memory[i])} МБ\n`;
	}

	embed.setDescription(description);
	embed.addFields([
		{ name: 'Всего', value: `Серверов: ${inlineCode(sum(guilds))}, ОЗУ: ${inlineCode(sum(memory).toFixed(2))} МБ` },
	]);
	await interaction.editReply({ embeds: [embed], ephemeral: interaction.options.getBoolean('ephemeral') ?? true });
}

export default {
	helpers,
	run,
};
