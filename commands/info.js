import { EmbedBuilder } from 'discord.js';
import emojis from '../models/emojis';
import db from '../services/db';
import colors from '../models/colors';
import boosts from '../models/boosts';
import beforeDate from '../utils/beforeDate';

export const helpers = {
	ephemeral: false,
};

export async function run(interaction) {
	/**
	 * @type {{upCount: number, boost: number, boostTime: Date, status: number, place: number, rating: number, comments: number}}
	 */
	const guild = await db.oneMulti(
		`SET @row_number = 0; SELECT upCount, boost, boostTime, status, place, rating, comments FROM server
	  LEFT JOIN boost using(id)
	  LEFT JOIN (SELECT id, (@row_number:=@row_number + 1) AS place FROM server WHERE bot = 1 ORDER BY upCount DESC, upTime, id) AS temp using(id)
	  LEFT JOIN (SELECT servId as id, SUM(rate) as rating FROM rating WHERE servId = ?) AS rating using(id)
	  LEFT JOIN (SELECT servId as id, COUNT(*) as comments FROM comments WHERE servId = ?) AS с using(id)
	  WHERE id = ?`,
		[interaction.guildId, interaction.guildId, interaction.guildId]
	);

	const pins = emojis.pins.filter(({ id }) => guild.status & id);

	const endDate = new Date();
	endDate.setMonth(
		endDate.getDate() > 15 || (endDate.getDate() === 15 && endDate.getHours() > 12)
			? endDate.getMonth() + 1
			: endDate.getMonth(),
		endDate.getDate() > 15 ||
			(endDate.getDate() === 15 && endDate.getHours() > 12) ||
			(endDate.getDate() === 1 && endDate.getHours() < 12)
			? 1
			: 15
	);
	endDate.setHours(12, 0);

	const fields = [
		{
			name: 'Продвижение:',
			value: `${emojis.owner} Место на сайте: **${guild.place}**\n${emojis.ups} Всего UP очков: **${guild.upCount}**`,
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
				? `«**Boost ${boosts[guild.boost]}**», до <t:${Math.floor(guild.boostTime / 1000)}:D>`
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
		.setFooter({
			text: `Новый сезон через ${beforeDate(endDate)}`,
		});

	await interaction.editReply({ embeds: [embed] });
}

export default {
	helpers,
	run,
};
