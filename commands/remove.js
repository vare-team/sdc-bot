import { MessageEmbed } from 'discord.js';
import db from '../services/db';
import colors from '../models/colors';
import log from '../utils/log';

export const helpers = {
	ephemeral: false,
};

export async function run(interaction) {
	if (interaction.guildId !== '669867414409969664') return;

	const id = interaction.options.getString('id');
	if (!id) return interaction.editReply({ content: 'ID не валидный!' });

	const guild = await bot.guilds.fetch(id);
	if (!guild) return interaction.editReply({ content: 'Гильдия не найдена!' });

	await guild.leave();
	await db.query('DELETE FROM server WHERE id = ?', [id]);

	log(`Removing guild: ${guild.name} (${guild.id})`);

	const embed = new MessageEmbed()
		.setAuthor(`Успешно! Сервер «${guild.name}» удален!`, guild.iconURL())
		.setColor(colors.green)
		.setTimestamp()
		.setFooter(interaction.user.tag);

	await interaction.editReply({ embeds: [embed] });
}

export default {
	helpers,
	run,
};
