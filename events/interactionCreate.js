import commands from '../commands';
import log from '../utils/log';

export default async function (interaction) {
	if (!interaction.inGuild() || !interaction.isCommand()) return;

	const command = commands[interaction.commandName];
	await interaction.deferReply({ ephemeral: interaction.options.getBoolean('ephemeral') ?? command.helpers.ephemeral });

	try {
		await command.run(interaction);
	} catch (e) {
		if (e.code === 10062) {
			log(interaction.commandName + ' | ' + e.message);
		} else {
			console.warn(e);
		}
	}
}
