import commands from '../commands';

export default async function (interaction) {
	if (!interaction.inGuild() || !interaction.isCommand()) return;

	try {
		await commands[interaction.commandName](interaction);
	} catch (e) {
		console.log(e);
	}
}
