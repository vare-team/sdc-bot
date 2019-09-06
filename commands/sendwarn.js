exports.help = {
	flag: 2,
	args: 1
}

exports.run = async (client, msg, args) => {

	let gg = await client.shard.broadcastEval(`
		let guild = this.guilds.get('${args[1]}');
		guild ? [guild.ownerID, guild.name] : 0
	`);

	gg = gg.find(g => g);

	console.log(gg);

	if (!gg) return msg.reply('Не могу найти гильдию.')

	client.users.get(gg[0]).send(`Здравствуйте, Вас беспокоит поддержка сайта server-discord.com!\nНа Ваш сервер «${gg[1]}», поступили жалобы за рассылку спама – это нарушение прямых правил Discord, а также нашего сайта!\nПри повторном нарушении правил мы будем вынуждены: удалить Ваш сервер с нашего сайта и передать информацию о нарушениях в Discord.\n\nP.s.: Всю доп.информацию Вы сможете найти на нашем сервере тех.поддержки SD.Community.`)
	.catch(err => msg.reply('Не смог отправить сообщение. Возможно, у владельца закрыт ЛС.'))
	.then(msg.reply(`Отправил сообщение ${client.users.get(gg[0]).tag}, владельца гильдии ${gg[1]}`));

}