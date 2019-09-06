const msgid = ['577804676368433152', '577803342810710031'];

module.exports = (client, msg) => {
	if (msgid.indexOf(msg.channel.id) != -1) {msg.react('👍'); return setTimeout(() => msg.react('👎'), 300)}

	if (msg.channel.type == 'dm' && msg.author.id != client.user.id && Object.keys(client.userLib.admins).indexOf(msg.author.id) == -1) {client.userLib.dm.send(msg.content, {username: `${msg.author.tag} (${msg.author.id})`,avatarURL: msg.author.avatarURL});}

	if (msg.author.bot || !msg.content.toLowerCase().startsWith('s.')) return;

	const args = msg.content.slice(2).trim().split(/ +/g);

	const command = args[0].toLowerCase();

	const cmd = client.commands.get(command);
	if (!cmd) return;

	if (msg.channel.type == 'dm' && Object.keys(client.userLib.admins).indexOf(msg.author.id) == -1) return msg.channel.send("Команды недоступны в личных сообщениях.");

	if (Object.keys(client.userLib.admins).indexOf(msg.author.id) == -1 && cmd.help.flag) return;

	if (cmd.help.flag && client.userLib.admins[msg.author.id] != 0 && cmd.help.flag <= client.userLib.admins[msg.author.id]) return msg.author.send('У вас недостаточно прав!');

	if (msg.channel.type != 'dm' && !msg.channel.permissionsFor(client.user).has("SEND_MESSAGES"))
		return msg.author.send(`У меня нет разрешения отправлять сообщения в ${msg.channel} канале.`);

	if (msg.channel.type != 'dm' && !msg.channel.permissionsFor(client.user).has("EMBED_LINKS"))
		return msg.reply(`У меня нет разрешения отправлять ссылки в данном канале. Без него я не смогу работать тут.`);

	// if (msg.channel.type != 'dm' && !msg.channel.permissionsFor(client.user).has("MANAGE_MESSAGES"))
	// 	msg.reply(`У меня нет разрешения удалять сообщения. Если вы хотите сохранить чат в чистоте выдайте право.`);

	if (cmd.help.args && !args[1]) 
	  return msg.reply("Ошибка! Отстутствует аргумент команды!")

	cmd.run(client, msg, args);
};

//flag

//0 - user

//1 - admin tier 0

//2 - admin tier 1