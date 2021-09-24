import { MessageEmbed } from 'discord.js';
import links from '../models/links';
import db from '../services/db';
import colors from '../models/colors';

export default async function (interaction) {
	const social = interaction.options.getString('сайт');
	const socials = await db.one('SELECT * FROM userUrls WHERE id = ?', [interaction.guild.id]);
	console.log(socials);

	if (!socials?.[social]) {
		interaction.reply({ content: 'Такая ссылка у сервера не задана!', ephemeral: true });
		return;
	}

	const link = links[social];
	const embed = new MessageEmbed()
		.setColor(colors.blue)
		.setFooter('Ссылка, указанная на сайте мониторинга.')
		.setAuthor(link.name, link.icon, link.url + socials?.[social] ?? '');

	interaction.reply({ embeds: [embed] });
}
