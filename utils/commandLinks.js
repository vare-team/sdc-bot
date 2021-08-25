const { MessageEmbed } = require("discord.js");
exports.run = async (interaction) => {
	// Абстрактный гет ссылок сервера по ID гильдии

	let embed = new MessageEmbed()
		.setFooter(interaction.member.guild.name, interaction.member.guild.iconURL())
		.setColor('#7289DA')
		.setFooter('Ссылка, указанная на сайте мониторинга.');


	switch (interaction.options.getString('сайт')) {
		case 'vk':
			embed.setAuthor('ВКонтакте', 'https://cdn.discordapp.com/attachments/581070953703014403/880155948910538782/VK.com-logo.png', 'https://vk.com/')
			break;
		case 'patreon':
			embed.setAuthor('Патреон', 'https://cdn.discordapp.com/attachments/581070953703014403/880156878460571658/Digital-Patreon-Logo_FieryCoral.png', 'https://patreon.com/')
			break;
		case 'youtube':
			embed.setAuthor('YouTube', 'https://cdn.discordapp.com/attachments/581070953703014403/880157139916718170/YouTube_social_white_squircle_2017.png', 'https://youtube.com/')
			break;
		case 'custom':
			embed.setAuthor('Веб сайт', '', 'https://vk.com/')
			break;
	}

	return interaction.reply( {embeds: [embed] } );
}
