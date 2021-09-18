import { MessageAttachment, MessageEmbed } from 'discord.js';
import randomInt from '../utils/random';
import captcha from '../services/captcha';

const codes = {};

export default async function (interaction) {
	const code = interaction.options.getInteger('код');
	const embed = new MessageEmbed().setAuthor(
		interaction.member.guild.name,
		interaction.member.guild.iconURL(),
		`https://server-discord.com/${interaction.member.guild_id}`
	);

	if (!code) {
		if (!codes[interaction.guild_id]) codes[interaction.guild_id] = {};
		codes[interaction.guild_id][interaction.user.id] = { code: randomInt(1000, 9999), time: Date.now() };

		console.log(codes[interaction.guild_id][interaction.user.id].code);

		const file = new MessageAttachment(captcha(codes[interaction.guild_id][interaction.user.id].code), 'code.jpeg');
		embed
			.setImage('attachment://code.jpeg')
			.setDescription('Введите число, написанное на изображении, используя команду ``/up XXXX``')
			.setColor('#7289DA')
			.setFooter('Данный код будет действителен в течении 1 минуты!');

		await interaction.reply({ ephemeral: true, embeds: [embed], files: [file] });
		return;
	}

	await interaction.deferReply();
	embed.setFooter(interaction.user.tag, interaction.user.displayAvatarURL());

	if (!codes[interaction.guild_id]?.[interaction.user.id]?.code) {
		embed.setDescription('Введите ``/up`` без кода, что бы его сгенерировать!').setColor('#FAA61A');
		await interaction.editReply({ ephemeral: true, embeds: [embed] });
		return;
	}

	if (codes[interaction.guild_id][interaction.user.id].code !== code) {
		embed.setDescription('Код не верен!').setColor('#F04747');
		await interaction.editReply({ ephemeral: true, embeds: [embed] });
		return;
	}

	if (Date.now() - codes[interaction.guild_id][interaction.user.id].time > 60 * 1e3) {
		embed.setDescription('Срок действия кода истёк!\nПолучите новый, прописав команду ``/up``!').setColor('#F04747');
		await interaction.editReply({ ephemeral: true, embeds: [embed] });
		return;
	}

	const upTime = new Date();
	embed.setDescription(`**Успешный Up!**\nВремя фиксации апа: <t:${Math.floor(+upTime / 1000)}:T>`).setColor('#43B581');
	await interaction.editReply({ embeds: [embed] });

	delete codes[interaction.guild_id][interaction.user.id];
	if (Object.keys(codes[interaction.guild_id]).length === 0) delete codes[interaction.guild_id];
}
