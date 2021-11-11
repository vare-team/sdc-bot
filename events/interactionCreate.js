import commands from '../commands';
import log from '../utils/log';

export default async function (interaction) {
	if (!interaction.inGuild() || !interaction.isCommand()) return;

	const command = commands[interaction.commandName];
	await interaction.deferReply({ ephemeral: interaction.options.getBoolean('ephemeral') ?? command.helpers.ephemeral });

	try {
		await command.run(interaction);
	} catch (e) {
    await interaction.editReply({content: 'Произошла ошибка при выполнении команды. Обратитесь на сервер поддержки Vare.\n' + e.message})
		if (e.code === 10062) {
			log(interaction.commandName + ' | ' + e.message);
		} else {
			console.warn(e);
		}
	}
}
