exports.help = {
	flag: 0,
	args: 0
}

exports.run = (client, msg) => {
	let embed = new client.userLib.discord.RichEmbed().setAuthor("СПИСОК КОМАНД Server-Discord.com").setColor('#3498DB').setTimestamp().setFooter(`© Server-Discord.com`, client.user.avatarURL)
		.setThumbnail(`https://cdn.discordapp.com/attachments/510728319902416897/533596994149548033/info.png`)
		.addField("Команды", `**s.up\ns.info\ns.s [name]**`, true)
		.addField("Описание", `*Up сервер.\nИнформация о сервере.\nПолучение привязанной ссылки.*`, true)
		.addField("Ссылки", `[Сайт](https://server-discord.com)\n[Сервер поддержки](https://discord.gg/bDum6sp)`, true);;
	msg.channel.send({embed});
}