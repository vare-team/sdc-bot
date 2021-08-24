const messages = require('../utils/replies');  // Заглушка для тестов
const up = require('../utils/commandUp');

module.exports = () => (interaction) => {

	if (!interaction.inGuild() || !interaction.isCommand()) return; // В гилдии и это команда

	if (interaction.commandName === 'up') {
		return up.run(interaction);
	}


	interaction.reply({ embeds: messages[interaction.commandName].embeds }).then(r => console.log(r)) // Заглушка для тестов
}
