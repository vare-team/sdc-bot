import { EmbedBuilder } from 'discord.js';
import emojis from '../models/emojis';
import db from '../services/db';
import colors from '../models/colors';
import boosts from '../models/boosts';
import beforeDate from '../utils/beforeDate';

export const helpers = {
	ephemeral: false,
};

const offset = 3;

export async function run(interaction) {
	/**
	 * @type {{up_count: number, boost: number, boost_end_at: Date, status: number, place: number, rating: number, comments: number}}
	 */
	const guild = await db.oneMulti(
		`SET @row_number = 0;
		SELECT up_count, boost, boost_end_at, status, place, SUM(c.rate) as rating, COUNT(c.text) as comments
		FROM (SELECT id, up_count, boost, boost_end_at, status, (@row_number := @row_number + 1) AS place FROM guilds WHERE is_bot = 1 ORDER BY up_count DESC, up_at, id) as t
					 LEFT JOIN comments c ON t.id = c.guild_id
		WHERE t.id = ? GROUP BY t.id`,
		[interaction.guildId, interaction.guildId, interaction.guildId]
	);

	const pins = emojis.pins.filter(({ id }) => guild.status & id);

	const endDate = new Date();
	endDate.setMonth(
		endDate.getDate() > 15 || (endDate.getDate() === 15 && endDate.getHours() > 12 - offset)
			? endDate.getMonth() + 1
			: endDate.getMonth(),
		endDate.getDate() > 15 ||
			(endDate.getDate() === 15 && endDate.getHours() > 12 - offset) ||
			(endDate.getDate() === 1 && endDate.getHours() < 12 - offset)
			? 1
			: 15
	);
	endDate.setHours(12 - offset, 0);

	const fields = [
		{
			name: 'Продвижение:',
			value: `${emojis.owner} Место на сайте: **${guild.place}**\n${emojis.ups} Всего UP очков: **${guild.up_count}**`,
			inline: true,
		},
		{
			name: 'Информация:',
			value: `${emojis.rating} Рейтинг: **${guild.rating ?? 0}**\n${emojis.comment} Отзывов: **${
				guild.comments ?? 0
			}**`,
			inline: true,
		},
		{
			name: 'Буст:',
			value: guild.boost
				? `«**Boost ${boosts[guild.boost]}**», до <t:${Math.floor(guild.boost_end_at / 1000)}:D>`
				: '[Отсутствует](https://server-discord.com/boost)',
		},
		{
			name: 'Значки: ',
			value: pins.length ? pins.map(({ name, icon }) => `${icon} - ${name}`).join('\n') : 'Не выданы',
		},
	];

	const embed = new EmbedBuilder()
		.setAuthor({
			name: `Сервер «${interaction.guild.name}»`,
			iconURL: interaction.guild.iconURL(),
			url: `https://server-discord.com/${interaction.guildId}`,
		})
		.setColor(colors.blue)
		.addFields(fields)
		.setFooter({ text: `Новый сезон через ${beforeDate(endDate)}` });

	await interaction.editReply({ embeds: [embed] });
}

export default {
	helpers,
	run,
};
