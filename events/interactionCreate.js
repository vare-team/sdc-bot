const messages = require('../utils/replies');  // Заглушка для тестов
const up = require('../utils/commandUp');
const link = require('../utils/commandLinks');

module.exports = () => (interaction) => {

	if (!interaction.inGuild() || !interaction.isCommand()) return; // В гилдии и это команда

	console.log(interaction.commandName)

	switch (interaction.commandName) {
		case 'up':
			return up.run(interaction);
			break;
		case 'link':
			return link.run(interaction);
	}


	interaction.reply({ embeds: messages[interaction.commandName].embeds }).then(r => console.log(r)) // Заглушка для тестов
}
