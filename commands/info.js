import { MessageEmbed } from 'discord.js';
import emojis from '../models/emojis';

export default async function (interaction) {
	let guild = { place: 333, rating: 333, boost: { type: 'Boost MAX', time: Date.now() }, up: 333, comments: 333 };

	let embed = new MessageEmbed()
		.setAuthor(
			'Сервер «' + interaction.guild.name + '»',
			interaction.guild.iconURL(),
			'https://server-discord.com/' + interaction.guildId
		)
		.setColor('#7289DA')
		.addField(
			'Продвижение:',
			`${emojis.owner} Место на сайте: **${guild.place}**\n${emojis.ups} Всего UP очков: **${guild.up}**`,
			true
		)
		.addField(
			'Информация:',
			`${emojis.rating} Рейтинг: **${guild.rating}**\n${emojis.comment} Отзывов: **${guild.comments}**`,
			true
		)
		.addField(
			'Буст:',
			guild.boost.type
				? `«**${guild.boost.type}**», до <t:${Math.floor(guild.boost.time / 1000)}:D>`
				: '[Отсутсвует](https://server-discord.com/boost)'
		)
		.addField('Значки: ', `${emojis.spamhunt} — Охотник на спамеров\n${emojis.youtube} — Ютубер`);

	interaction.reply({ embeds: [embed] });
}
