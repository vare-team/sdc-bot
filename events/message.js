export default function (message) {
	if (!message.content.startsWith('s.')) return;

	if (message.content.includes('s.up'))
		message.reply(
			'Ошибка! Бот переходит на новый тип взаимодействия - слеш команды!\nДля того, что бы апнуть сервер пропишите ``/up``!'
		);

	if (message.content.includes('s.info'))
		message.reply(
			'Ошибка! Бот переходит на новый тип взаимодействия - слеш команды!\nДля того, что бы узнать информацию о сервере пропишите ``/info``!'
		);

	if (message.content.includes('s.s'))
		message.reply(
			'Ошибка! Бот переходит на новый тип взаимодействия - слеш команды!\nДля того, что бы узнать ссылки пропишите ``/links``!'
		);
}
