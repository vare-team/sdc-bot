import { EmbedBuilder } from 'discord.js';
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
	const url = link.url + socials?.[social !== 'custom' ? social : 'website'] ?? '';
	const embed = new EmbedBuilder()
		.setColor(colors.blue)
		.setFooter({ text: 'Ссылка, указанная на сайте мониторинга.' })
		.setAuthor({
			name: link.name,
			iconURL: link.icon?.length > 0 ? link.icon : null,
			url: url?.length > 0 ? url : null,
		});

	await interaction.editReply({ embeds: [embed] });
}

export default {
	helpers,
	run,
};
