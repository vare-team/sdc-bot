import messages from '../models/replies';
import commands from '../commands';

export default async function (interaction) {
	if (!interaction.inGuild() || !interaction.isCommand()) return;

	try {
		if (!commands.hasOwnProperty(interaction.commandName)) {
			interaction.reply({ embeds: messages[interaction.commandName].embeds }); // Заглушка для тестов
			return;
		}

		await commands[interaction.commandName](interaction);
	} catch (e) {
		console.log(e);
		interaction.reply('error');
	}
}
