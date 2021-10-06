import { MessageEmbed } from 'discord.js';
import links from '../models/links';
import db from '../services/db';
import colors from '../models/colors';

export const helpers = {
	ephemeral: false,
};

export async function run(interaction) {
	const social = interaction.options.getString('сайт');
	const socials = await db.one('SELECT * FROM userUrls WHERE id = ?', [interaction.guildId]);
	console.log(socials);

	if (!socials?.[social !== 'custom' ? social : 'website']) {
		await interaction.deleteReply();
		await interaction.followUp({ content: 'Такая ссылка у сервера не задана!', ephemeral: true });
		return;
	}

	const link = links[social];
	const embed = new MessageEmbed()
		.setColor(colors.blue)
		.setFooter('Ссылка, указанная на сайте мониторинга.')
		.setAuthor(link.name, link.icon, link.url + socials?.[social !== 'custom' ? social : 'website'] ?? '');

	await interaction.editReply({ embeds: [embed] });
}

export default {
	helpers,
	run,
};
