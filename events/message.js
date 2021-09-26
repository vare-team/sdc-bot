export default function (message) {
	if (!message.content.startsWith('s.')) return;

	if (message.content.includes('s.up'))
		message.reply(
			'Ошибка! Бот переходит на новый тип взаимодействия - слеш команды!\nДля того, что бы апнуть сервер пропишите `/up`!\nОднако, если слеш-команды не появились, перепригласите бота с нужными правами!\nПриглашение: https://discord.com/oauth2/authorize?client_id=464272403766444044&scope=bot+applications.commands&permissions=3533825'
		);

	if (message.content.includes('s.info'))
		message.reply(
			'Ошибка! Бот переходит на новый тип взаимодействия - слеш команды!\nДля того, что бы узнать информацию о сервере пропишите `/info`!\nОднако, если слеш-команды не появились, перепригласите бота с нужными правами!\nПриглашение: https://discord.com/oauth2/authorize?client_id=464272403766444044&scope=bot+applications.commands&permissions=3533825'
		);

	if (message.content.includes('s.s'))
		message.reply(
			'Ошибка! Бот переходит на новый тип взаимодействия - слеш команды!\nДля того, что бы узнать ссылки пропишите `/links`!\nОднако, если слеш-команды не появились, перепригласите бота с нужными правами!\nПриглашение: https://discord.com/oauth2/authorize?client_id=464272403766444044&scope=bot+applications.commands&permissions=3533825'
		);
}
