exports.help = {
	flag: 2,
	args: 1
}

exports.run = (client, msg, args) => {

	if (!client.users.get(args[1])) return msg.reply('Не могу найти пользователя.');

	let userid = args[1];

	args.shift();
	args.shift();

	client.users.get(userid).send(args.join(' '))
	.catch(err => msg.reply('Не смог отправить сообщение. Возможно, закрыт ЛС.'))
	.then(msg.reply(`Отправил сообщение ${client.users.get(userid).tag}`));


}