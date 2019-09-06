exports.help = {
	flag: 1,
	args: 1
}

exports.run = async (client, msg, args) => {
	if (!require('fs').existsSync('/root/bots/sediscom/commands/' + args[1] + ".js")) return msg.reply(`СЛОЖНА СЛОЖНА НИХУРА НЕ ПОНЯТНО! КОМАНДЫ ${args[1]} НЕТ!`);

	let ans = await client.shard.broadcastEval(`
		delete require.cache[require.resolve(\`/root/bots/sediscom/commands/${args[1]}.js\`)];
		this.commands.delete(\'${args[1]}\');
		const props = require(\`/root/bots/sediscom/commands/${args[1]}.js\`);
		this.commands.set(\'${args[1]}\', props);
		true;
	`);

	if (ans.every(i => i)) msg.reply(`Команда ${args[1]} был перезапущена!`);
	else msg.reply(`Произошла ошибка!`);
}