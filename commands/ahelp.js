exports.help = {
	flag: 10,
	args: 0
}

exports.run = (client, msg) => {
	let embed = new client.userLib.discord.RichEmbed().setAuthor("Server-Discord.com - Команды для Администрации.", client.user.avatarURL).setColor('#3498DB').setTimestamp().setFooter(`© Server-Discord.com`, client.user.avatarURL)
				.setThumbnail(`https://cdn.discordapp.com/attachments/510728319902416897/533596994149548033/info.png`)
				.addField("Команда", `**s.ahelp \n s.invite [id] \n s.reload [command]\n s.remove [id] \n s.senddm [id] [msg] \n s.sendwarn [id] \n s.sync \n s.upsert [id]\n s.verify \n**`, true)
				.addField("Описание", `*Все Админ. команды. \n Приглашение на сервер \n Перезагрузить команду. \n Удалить сервер \n Отпраить сообщение в ЛС \n Отправить предупреждение в ЛС \n Синхронизировать базу \n Обнов./Добав. сервер. \n Проверить на админа*`, true)
	msg.channel.send({embed});
}