import commands from '../commands';

export default async function (interaction) {
	if (!interaction.inGuild() || !interaction.isCommand()) return;

	const command = commands[interaction.commandName];
	await interaction.deferReply({ ephemeral: interaction.options.getBoolean('ephemeral') ?? command.helpers.ephemeral });

	try {
		await command.run(interaction);
	} catch (e) {
		console.warn(e);
	}
}
