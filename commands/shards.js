import { MessageEmbed } from 'discord.js';
import colors from '../models/colors';
import shardNames from '../models/shardNames';

const sum = values => values.reduce((p, v) => p + v, 0);

export default async function (interaction) {
	const embed = new MessageEmbed()
		.setAuthor(bot.user.username, bot.user.avatarURL(), 'https://server-discord.com')
		.setFooter(`Шард сервера: ${shardNames[bot.shard.ids[0]]}`)
		.setColor(colors.blue);

	const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
	const guilds = await bot.shard.fetchClientValues('guilds.cache.size');
	const channels = await bot.shard.fetchClientValues('channels.cache.size');
	const pings = await bot.shard.broadcastEval(c => c.ws.ping.toFixed(0));
	const memory = await bot.shard.broadcastEval(() => +(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2));

	for (let i = 0, length = bot.shard.count; i < length; i++) {
		embed.addField(
			`${i + 1}. ${shardNames[i]} ${i === bot.shard.ids[0] ? '←' : ''}`,
			`Серверов: \`\`${guilds[i]}\`\`, Каналы: \`\`${channels[i]}\`\`, Пинг: \`\`${pings[i]} мс\`\`, ОЗУ: \`\`${memory[i]} МБ\`\``
		);
	}

	embed.addField('​', '​');
	embed.addField(
		`Всего: ${bot.shard.count}`,
		`Серверов: \`\`${sum(guilds)}\`\`, Каналы: \`\`${sum(channels)}\`\`, ОЗУ: \`\`${sum(memory)} МБ\`\``
	);

	interaction.reply({ embeds: [embed], ephemeral });
}
