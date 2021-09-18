import { MessageEmbed } from 'discord.js';
import links from '../models/links';
import db from '../services/db';

export default async function (interaction) {
	const social = interaction.options.getString('сайт');
	const [[socials]] = await db.query('SELECT * FROM userUrls WHERE id = ?', [interaction.guild.id]);
	console.log(socials);

	if (!socials?.[social]) {
		interaction.reply({ content: 'Такая ссылка у сервера не задана!', ephemeral: true });
		return;
	}

	const link = links[social];
	const embed = new MessageEmbed()
		.setColor('#7289DA')
		.setFooter('Ссылка, указанная на сайте мониторинга.')
		.setAuthor(link.name, link.icon, link.url + socials?.[social] ?? '');

	interaction.reply({ embeds: [embed] });
}
