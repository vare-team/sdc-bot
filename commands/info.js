import { MessageEmbed } from 'discord.js';
import emojis from '../models/emojis';
import db from '../services/db';
import colors from '../models/colors';
import boosts from '../models/boosts';
import beforeDate from '../utils/beforeDate';

export const helpers = {
	ephemeral: false,
};

export async function run(interaction) {
	await db.query('SET @row_number = 0');

	/**
	 * @type {{upCount: number, boost: number, boostTime: Date, status: number, place: number, rating: number, comments: number}}
	 */
	const guild = await db.one(
		`SELECT upCount, boost, boostTime, status, place, rating, comments FROM server
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

	let embed = new MessageEmbed()
		.setAuthor(
			'Сервер «' + interaction.guild.name + '»',
			interaction.guild.iconURL(),
			'https://server-discord.com/' + interaction.guildId
		)
		.setColor(colors.blue)
		.addField(
			'Продвижение:',
			`${emojis.owner} Место на сайте: **${guild.place}**\n${emojis.ups} Всего UP очков: **${guild.upCount}**`,
			true
		)
		.addField(
			'Информация:',
			`${emojis.rating} Рейтинг: **${guild.rating ?? 0}**\n${emojis.comment} Отзывов: **${guild.comments ?? 0}**`,
			true
		)
		.addField(
			'Буст:',
			guild.boost
				? `«**Boost ${boosts[guild.boost]}**», до <t:${Math.floor(guild.boostTime / 1000)}:D>`
				: '[Отсутствует](https://server-discord.com/boost)'
		)
		.addField('Значки: ', pins.length ? pins.map(({ name, icon }) => icon + ' - ' + name).join('\n') : 'Не выданы')
		.setFooter('Новый сезон через ' + beforeDate(endDate));

	await interaction.editReply({ embeds: [embed] });
}

export default {
	helpers,
	run,
};
