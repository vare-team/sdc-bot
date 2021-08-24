module.exports = () => (message) => {
	if (!message.content.startsWith('s.') && /[0-9]{4}/.test(message.content)) return;

	if (message.content.startsWith('s.up')) return message.reply('Ошибка! Бот переходит на новый тип взаимодействия - слеш команды!\nДля того, что бы апнутьть сервер пропишите \`\`/up\`\`!');
}
