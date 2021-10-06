import { MessageAttachment, MessageEmbed } from 'discord.js';
import randomInt from '../utils/random';
import captcha from '../services/captcha';
import db from '../services/db';
import log from '../utils/log';
import colors from '../models/colors';
import emojis from '../models/emojis';

const codes = {};

export const helpers = {
	ephemeral: false,
};

export async function run(interaction) {
	const code = interaction.options.getInteger('код');
	const embed = new MessageEmbed().setAuthor(
		interaction.guild.name,
		interaction.guild.iconURL(),
		`https://server-discord.com/${interaction.guildId}`
	);

	/**
	 * @type {{upTime: Date, status: number, boost: number, upCount: number}}
	 */
	const guild = await db.one('SELECT upTime, status, boost, upCount FROM server WHERE id = ?', [interaction.guildId]);

	if (Date.now() - guild.upTime <= 4 * 36e5) {
		const sendDate = Math.floor((+guild.upTime + 4 * 36e5) / 1000);
		embed.setDescription(`Up <t:${sendDate}:R>: <t:${sendDate}:T>`).setColor(colors.red);
		await interaction.editReply({ embeds: [embed] });
		return;
	}

	if (!guild.boost) {
		if (!code) {
			if (!codes[interaction.guildId]) codes[interaction.guildId] = {};
			codes[interaction.guildId][interaction.user.id] = { code: randomInt(1000, 9999), time: Date.now() };

			const file = new MessageAttachment(captcha(codes[interaction.guildId][interaction.user.id].code), 'code.jpeg');
			embed
				.setImage('attachment://code.jpeg')
				.setDescription('Введите число, написанное на изображении, используя команду `/up XXXX`')
				.setColor(colors.blue)
				.setFooter('Данный код будет действителен в течении 15 секунд!');

			await interaction.deleteReply();
			await interaction.followUp({ ephemeral: true, embeds: [embed], files: [file] });
			return;
		}

		if (!codes[interaction.guildId]?.[interaction.user.id]?.code) {
			embed.setDescription('Введите `/up` без кода, что бы его сгенерировать!').setColor(colors.yellow);
			await interaction.deleteReply();
			await interaction.followUp({ ephemeral: true, embeds: [embed] });
			return;
		}

		if (codes[interaction.guildId][interaction.user.id].code !== code) {
			embed.setDescription('Код не верен!').setColor(colors.red);
			await interaction.deleteReply();
			await interaction.followUp({ ephemeral: true, embeds: [embed] });
			return;
		}

		if (Date.now() - codes[interaction.guildId][interaction.user.id].time > 15 * 1e3) {
			embed.setDescription('Срок действия кода истёк!\nПолучите новый, прописав команду `/up`!').setColor(colors.red);
			await interaction.deleteReply();
			await interaction.followUp({ ephemeral: true, embeds: [embed] });
			return;
		}

		const { upTime: upTimeDB } = await db.one('SELECT upTime FROM server WHERE id = ?', [interaction.guildId]);
		if (Date.now() - upTimeDB <= 4 * 36e5) {
			const sendDate = Math.floor((upTimeDB + 4 * 36e5) / 1000);
			embed.setDescription(`Up <t:${sendDate}:R>: <t:${sendDate}:T>`).setColor(colors.red);
			await interaction.editReply({ embeds: [embed] });
			return;
		}
	}

	const upTime = new Date();
	const upCount = guild.upCount + (0x8 & guild.status ? 1 : 0) + guild.boost + 1;

	await db.query(`UPDATE server SET upTime = ?, upCount = ?, members = ?, ownerID = ? WHERE id = ?`, [
		upTime,
		upCount,
		interaction.guild.memberCount,
		interaction.guild.ownerId,
		interaction.guildId,
	]);

	log(
		`{Guild UP} Ups "${upCount}", User "${interaction.user.tag}" (${interaction.user.id}), Guild "${interaction.guild.name}" (${interaction.guildId}), Channel ID ${interaction.channelId}`
	);

	embed
		.setDescription(`**Успешный Up!**\nВремя фиксации апа: <t:${Math.floor(+upTime / 1000)}:T>`)
		.setColor(colors.green);

	if (guild.boost) {
		await db.query('SET @row_number = 0');
		const { place } = await db.one(
			`SELECT place FROM (SELECT id, (@row_number := @row_number + 1) AS place FROM server WHERE bot = 1 ORDER BY upCount DESC, upTime, id) as t WHERE id = ?`,
			[interaction.guildId]
		);

		embed.addField(
			'Буст информация:',
			`${emojis.owner} Место на сайте: **${place}**\n${emojis.ups} Всего UP очков: **${upCount}**`
		);
	}

	await interaction.editReply({ embeds: [embed] });

	if (!guild.boost) {
		delete codes[interaction.guildId][interaction.user.id];
		if (Object.keys(codes[interaction.guildId]).length === 0) delete codes[interaction.guildId];
	}
}

export default {
	helpers,
	run,
};
