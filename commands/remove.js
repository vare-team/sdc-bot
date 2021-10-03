import { MessageEmbed } from 'discord.js';
import db from '../services/db';
import colors from '../models/colors';

export default async function (interaction) {
	const id = interaction.options.getString('id');
	const guild = await bot.guilds.fetch(id);

	await guild.leave();
	await db.query('DELETE FROM server WHERE id = ?', [id]);

	const embed = new MessageEmbed()
		.setAuthor(`Успешно! Сервер ${guild.name} удален!`, guild.iconURL())
		.setColor(colors.green)
		.setTimestamp()
		.setFooter(interaction.user.tag);

	interaction.reply({ embeds: [embed] });
}
