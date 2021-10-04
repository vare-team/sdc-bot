import { MessageEmbed } from 'discord.js';
import colors from '../models/colors';
import shardNames from '../models/shardNames';

export default async function (interaction) {
	const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

	const embed = new MessageEmbed()
		.setAuthor(bot.user.username, bot.user.avatarURL(), 'https://server-discord.com')
		.setFooter(`Шард сервера: ${shardNames[bot.shard.ids[0]]}`)
		.setColor(colors.blue);

	const guilds = await bot.shard.fetchClientValues('guilds.cache.size');
	const users = await bot.shard.fetchClientValues('users.cache.size');
	const channels = await bot.shard.fetchClientValues('channels.cache.size');
	const pings = await bot.shard.fetchClientValues('ws.ping');
	const memory = await bot.shard.broadcastEval(() => (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2));

	for (let i = 0, length = bot.shard.count; i < length; i++) {
		embed.addField(
			`${i + 1}. ${shardNames[i]} ${i === bot.shard.ids[0] ? '←' : ''}`,
			`Серверов: \`${guilds[i]}\`, Пользователи: \`${users[i]}\`, Каналы: \`${
				channels[i]
			}\`, Пинг: \`${Math.floor(pings[i])} мс\`, ОЗУ: \`${memory[i]} МБ\``
		);
	}

	embed.addField('-', '-');
	embed.addField(
		`Всего: ${bot.shard.count}`,
		`Серверов: \`\`${guilds.reduce((prev, val) => prev + val, 0)}\`\`, Пользователи: \`\`${users.reduce(
			(p, v) => p + v,
			0
		)}\`\`, Каналы: \`\`${channels.reduce((prev, val) => prev + val, 0)}\`\``
	);

	interaction.reply({ embeds: [embed], ephemeral });
}
