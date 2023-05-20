import { AttachmentBuilder, EmbedBuilder, inlineCode, WebhookClient } from 'discord.js';
import randomInt from '../utils/random';
import captcha from '../services/captcha';
import db from '../services/db';
import log from '../utils/log';
import colors from '../models/colors';
import emojis from '../models/emojis';

const codes = {};
const webhook = new WebhookClient({ url: process.env.WEBHOOK_URL });

export const helpers = {
	ephemeral: false,
};

export async function run(interaction) {
	const upTime = new Date();
	const code = interaction.options.getInteger('код');
	const embed = new EmbedBuilder().setAuthor({
		name: interaction.guild.name,
		iconURL: interaction.guild.iconURL(),
		url: `https://server-discord.com/${interaction.guildId}`,
	});

	/**
	 * @type {{up_at: Date, status: number, boost: number, up_count: number}}
	 */
	const guild = await db.one('SELECT up_at, status, boost, up_count FROM guilds WHERE id = ?', [interaction.guildId]);

	if (Date.now() - guild.up_at <= 4 * 36e5) {
		const sendDate = Math.floor((+guild.up_at + 4 * 36e5) / 1000);
		embed.setDescription(`Up <t:${sendDate}:R>: <t:${sendDate}:T>`).setColor(colors.red);
		await interaction.editReply({ embeds: [embed] });
		return;
	}

	if (!guild.boost) {
		if (!code) {
			if (!codes[interaction.guildId]) codes[interaction.guildId] = {};
			codes[interaction.guildId][interaction.user.id] = { code: randomInt(1000, 9999), upTime };

			const file = new AttachmentBuilder(captcha(codes[interaction.guildId][interaction.user.id].code), {
				name: 'code.jpeg',
			});

			embed
				.setImage('attachment://code.jpeg')
				.setDescription('Введите число, написанное на изображении, используя команду `/up XXXX`')
				.setColor(colors.blue)
				.setFooter({ text: 'Срок действия кода: 15 секунд' });

			await interaction.deleteReply();
			await interaction.followUp({ ephemeral: true, embeds: [embed], files: [file] });
			codes[interaction.guildId][interaction.user.id].time = Date.now();
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
	}

	const upCountLog = guild.up_count + (0x8 & guild.status ? 1 : 0) + guild.boost + 1;
	const user = interaction.user;
	await db.query(
		'INSERT INTO users (id, username, avatar, created_at, updated_at) VALUES (?, ?, ?, now(), now()) ON DUPLICATE KEY UPDATE username = ?, avatar = ?, updated_at = now()',
		[user.id, user.username, user.avatar, user.username, user.avatar]
	);
	await db.query(
		`UPDATE guilds SET up_at = ?, up_count = up_count + IF(0x8 & status, 1, 0) + boost + 1, members = ?, user_id = ? WHERE id = ?`,
		[
			guild.boost ? upTime : codes[interaction.guildId][interaction.user.id].upTime,
			interaction.guild.memberCount,
			interaction.guild.ownerId,
			interaction.guildId,
		]
	);

	log(
		`{Guild UP} Ups "${upCountLog}", User "${interaction.user.tag}" (${interaction.user.id}), Guild "${interaction.guild.name}" (${interaction.guildId}), Channel ID ${interaction.channelId}`
	);

	const logEmbed = new EmbedBuilder()
		.setDescription(
			`Guild: **[${interaction.guild.name}](https://server-discord.com/${interaction.guildId})**\nUser: ${inlineCode(
				interaction.user.tag
			)} | ${inlineCode(interaction.user.id)}\n\nTimestamp: ${inlineCode(upTime.getTime())}`
		)
		.setColor('#4997D0')
		.setFooter({ text: 'Emitted by Slash Command' });
	await webhook.send({ embeds: [logEmbed] });

	embed
		.setDescription(`**Успешный Up!**\nВремя фиксации апа: <t:${Math.floor(+upTime / 1000)}:T>`)
		.setColor(colors.green);

	if (guild.boost) {
		const { place, up_count } = await db.oneMulti(
			`SET @row_number = 0;
			SELECT place, up_count FROM (SELECT id, up_count, (@row_number := @row_number + 1) AS place FROM guilds WHERE is_bot = 1 ORDER BY up_count DESC, up_at, id) as t WHERE id = ?`,
			[interaction.guildId]
		);

		embed.addFields({
			name: 'Буст информация:',
			value: `${emojis.owner} Место на сайте: **${place}**\n${emojis.ups} Всего UP очков: **${up_count}**`,
		});
	}

	await interaction.editReply({ embeds: [embed] });

	if (!guild.boost) {
		delete codes[interaction.guildId][interaction.user.id];
		if (Object.keys(codes[interaction.guildId]).length === 0) delete codes[interaction.guildId];
	}

	// todo add db and api for metric
	// await db.query('INSERT INTO sdcstat(date, ups) VALUES (?, 1) ON DUPLICATE KEY UPDATE ups = ups + 1', [upTime]);
}

export default {
	helpers,
	run,
};
