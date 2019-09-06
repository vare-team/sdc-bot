exports.help = {
	flag: 0,
	args: 0
}

exports.run = (client, msg) => {

	let user = msg.mentions.users.first() ? msg.mentions.users.first() : msg.author; 

	let embed = new client.userLib.discord.RichEmbed().setAuthor(`${user.tag} ${Object.keys(client.userLib.admins).indexOf(user.id) == -1 ? 'НЕ' : ''} является администратором Server-Discord.com!`, user.avatarURL).setColor('#FF0000').setTimestamp().setFooter(`Валидация администрации Server-Discord.com`, client.user.avatarURL);
	msg.channel.send({embed});
}