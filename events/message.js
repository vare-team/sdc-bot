module.exports = () => (message) => {
	if (!message.content.startsWith('s.') && /[0-9]{4}/.test(message.content)) return;

	console.log(message.content);
}
