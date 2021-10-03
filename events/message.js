export default function (message) {
	if (!message.content.toLowerCase().startsWith('s.')) return;
	switch (message.content.toLowerCase()) {
		case 's.up':
			message.reply(
				'**Внимание! Бот переходит на новый тип взаимодействия - слеш команды!**\nДля того, что бы апнуть сервер пропишите `/up`!\nОднако, если слеш-команды не появились, перепригласите бота с нужными правами!\nПриглашение: https://discord.com/oauth2/authorize?client_id=464272403766444044&scope=bot+applications.commands&permissions=3533825'
			);
			break;
		case 's.info':
			message.reply(
				'**Внимание! Бот переходит на новый тип взаимодействия - слеш команды!**\nДля того, что бы апнуть сервер пропишите `/up`!\nОднако, если слеш-команды не появились, перепригласите бота с нужными правами!\nПриглашение: https://discord.com/oauth2/authorize?client_id=464272403766444044&scope=bot+applications.commands&permissions=3533825'
			);
			break;
		case 's.s':
			message.reply(
				'**Внимание! Бот переходит на новый тип взаимодействия - слеш команды!**\nДля того, что бы узнать ссылки пропишите `/links`!\nОднако, если слеш-команды не появились, перепригласите бота с нужными правами!\nПриглашение: https://discord.com/oauth2/authorize?client_id=464272403766444044&scope=bot+applications.commands&permissions=3533825'
			);
	}
}
