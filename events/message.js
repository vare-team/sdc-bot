function checkDeprecatedCommands(message) {
	if (!message.content.startsWith('s.')) return;

	const commands = [
		{ name: 's.up', description: 'Для того, что бы апнуть сервер пропишите `/up`!' },
		{ name: 's.info', description: 'Для того, что бы узнать информацию о сервере пропишите `/info`!' },
		{ name: 's.s', description: 'Для того, что бы узнать ссылки пропишите `/links`!' }
	]

	for (const command of commands) {
		if (message.content.includes(command.name)) message.reply(
			`Ошибка! Бот переходит на новый тип взаимодействия - слеш команды!${command.description}\nОднако, если слеш-команды не появились, перепригласите бота с нужными правами!\nПриглашение: https://discord.com/oauth2/authorize?client_id=464272403766444044&scope=bot+applications.commands&permissions=3533825`
		);
	}
}

export default function (message) {
	checkDeprecatedCommands(message);
}
