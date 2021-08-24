const { createCanvas } = require('canvas'),
			{ MessageAttachment, MessageEmbed } = require('discord.js'),
			types = ['italic', 'bold', 'italic bold'],
			colors = ['#FF6E4A', '#B756D8', '#F2FF40', '#00B64F', '#A62300', '#C187D3', '#4CA900', '#007633'];

let codes = {}; // Объект юзерей и кодов

exports.run = async (interaction) => {
	if (typeof interaction.options.getInteger('код') !== "number") { // Генерируем код
		codes[`${interaction.guild_id}_${interaction.user.id}`] = {code: randomInt(1000, 9999), time: new Date()}; // Запоминаем по ключу ID Гильдии _ ID Юзеря

		await interaction.deferReply();

		// Генерация капчи, сюда не лезть
		let canvas = createCanvas(300, 80),
					ctx = canvas.getContext('2d'),
					letters = codes[`${interaction.guild_id}_${interaction.user.id}`].code.toString();

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		let startPixel = randomInt(0, 80);

		ctx.fillStyle = '#202225';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		for (let step = 0; step < letters.length; step++) {
			ctx.beginPath();
			ctx.moveTo(0, randomInt(0, canvas.height));
			ctx.lineWidth = "1";
			ctx.setLineDash([]);
			ctx.strokeStyle = 'black';
			ctx.quadraticCurveTo(randomInt(-50, 50), randomInt(0, canvas.height), canvas.width, randomInt(0, 80));
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(0, randomInt(0, canvas.height));
			ctx.lineWidth = "3";
			ctx.strokeStyle = colors[randomInt(0, colors.length - 1)];
			ctx.setLineDash([randomInt(0, 5), randomInt(0, 2)]);
			ctx.quadraticCurveTo(randomInt(-50, 50), randomInt(0, canvas.height), canvas.width, randomInt(0, 80));
			ctx.stroke();

			ctx.font = types[randomInt(0, types.length - 1)] + " 48px arial";
			switch (randomInt(0, 1)) {
				case 0:
					ctx.fillStyle = colors[randomInt(0, colors.length - 1)];
					ctx.fillText(letters[step], startPixel, randomInt(40, 80));
					break;
				case 1:
					ctx.setLineDash([randomInt(2, 10), 1]);
					ctx.strokeStyle = colors[randomInt(0, colors.length - 1)];
					ctx.strokeText(letters[step], startPixel, randomInt(40, 80));
					break;
			}
			startPixel = startPixel + ctx.measureText(letters[step]).width + randomInt(0, 25);
		}
		// Генерация капчи, сюда не лезть

		const file = new MessageAttachment(canvas.toBuffer(), 'code.jpeg');
		let embed = new MessageEmbed().setAuthor(interaction.member.guild.name, interaction.member.guild.iconURL(), `https://server-discord.com/${interaction.member.guild.id}`).setImage('attachment://code.jpeg').setDescription('Введите число, написанное на изображении, используя команду \`\`/up XXXX\`\`').setColor('#7289DA').setFooter("Данный код будет действителен в течении 1 минуты!");
		interaction.editReply({ embeds: [embed], files: [file] });
	} else {
		if (typeof codes[`${interaction.guild_id}_${interaction.user.id}`] === "undefined") { // up прописан с кодом, но в памяти код не сгенерирован
			let embed = new MessageEmbed().setAuthor(interaction.member.guild.name, interaction.member.guild.iconURL(), `https://server-discord.com/${interaction.member.guild_id}`).setTitle('Введите \`\`/up\`\` без кода, что бы его сгенерировать!').setColor('#FAA61A').setFooter(interaction.user.tag, interaction.user.displayAvatarURL());
			return interaction.reply( {embeds: [embed] } );
		}

		if (codes[`${interaction.guild_id}_${interaction.user.id}`].code === interaction.options.getInteger('код')) { // Код из памяти совпал с введённым
			if (new Date - codes[`${interaction.guild_id}_${interaction.user.id}`].time > 60000) { // Срок действия кода истёк
				codes[`${interaction.guild_id}_${interaction.user.id}`] = undefined; // Забываем код
				let embed = new MessageEmbed().setAuthor(interaction.member.guild.name, interaction.member.guild.iconURL(), `https://server-discord.com/${interaction.member.guild_id}`).setTitle('Срок действия кода истёк!\nПолучите новый, прописав команду \`\`/up\`\`!').setColor('#F04747').setFooter(interaction.user.tag, interaction.user.displayAvatarURL());
				return interaction.reply( {embeds: [embed] } );
			}

			codes[`${interaction.guild_id}_${interaction.user.id}`] = undefined; // Так же забываем код, но уже если он валидный

			let embed = new MessageEmbed().setAuthor(interaction.member.guild.name, interaction.member.guild.iconURL(), `https://server-discord.com/${interaction.member.guild_id}`).setTitle('Успешный Up!').setColor('#43B581').setFooter(interaction.user.tag, interaction.user.displayAvatarURL());
			return interaction.reply( {embeds: [embed] } );
		} else { // Код не верный
			let embed = new MessageEmbed().setAuthor(interaction.member.guild.name, interaction.member.guild.iconURL(), `https://server-discord.com/${interaction.member.guild_id}`).setTitle('Код не действителен!').setColor('#F04747').setFooter(interaction.user.tag, interaction.user.displayAvatarURL());
			return interaction.reply( {embeds: [embed] } );
		}
	}
}

function randomInt(min, max) { // Маленькая функцмия рандома, хорошо бы вынести в ютилс.
	let rand = min - 0.5 + Math.random() * (max - min + 1);
	return Math.round(rand);
}
