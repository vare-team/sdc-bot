exports.help = {
	flag: 0,
	args: 0
}

let boosts = ['Light', 'Pro', 'Max'];

const captcha = require('../captcha');

exports.run = async (client, msg) => {

	if (client.userLib.cooldown.has(msg.guild.id)) return msg.reply('слишком быстро ты хочешь апнуть сервер!');

	client.userLib.cooldown.add(msg.guild.id);

	let data = await client.userLib.promise(client.userLib.db, client.userLib.db.queryRow, 'SELECT upTime, status, boost, upCount FROM server WHERE id = ?', [msg.guild.id]);
	data = data.res;

	const now = new Date();
	let embed, flaggg = 0;

	if (now - data.upTime <= 4 * 3600000) {
		let send = new Date(4 * 3600000 - (now - data.upTime));

		embed = new client.userLib.discord.RichEmbed()
			.setAuthor('0' + send.getUTCHours() + ':' + ('00' + send.getMinutes()).slice(-2) + ':' + ('00' + send.getSeconds()).slice(-2) + ' до следующего Up', `https://cdn.discordapp.com/attachments/510728319902416897/533596998570606612/clock.png`)
			.setColor('#4A90E2').setTimestamp().setFooter(msg.author.tag);
			
		msg.channel.send({embed});
		flaggg = 1;
	}

	if (!flaggg && !data.boost && !(await captcha(client.userLib.discord, msg.channel, msg.author))) {

		let embederr = new client.userLib.discord.RichEmbed()
			.setTitle('Каптча не пройдена!')
			.setColor('#ff0000')
			.setTimestamp();

		msg.channel.send(embederr);
		flaggg = 1;
	}

	let dataTime = await client.userLib.promise(client.userLib.db, client.userLib.db.queryValue, 'SELECT upTime FROM server WHERE id = ?', [msg.guild.id]);
	dataTime = dataTime.res;

	if (!flaggg && now - dataTime <= 4 * 3600000) {
		let send = new Date(4 * 3600000 - (now - dataTime));

		embed = new client.userLib.discord.RichEmbed()
			.setAuthor('0' + send.getUTCHours() + ':' + ('00' + send.getMinutes()).slice(-2) + ':' + ('00' + send.getSeconds()).slice(-2) + ' до следующего Up', `https://cdn.discordapp.com/attachments/510728319902416897/533596998570606612/clock.png`)
			.setColor('#4A90E2').setTimestamp().setFooter(msg.author.tag);
			
		msg.channel.send({embed});
		flaggg = 1;
	}

	if (flaggg) {
		client.userLib.cooldown.delete(msg.guild.id);
		return;
	}

	client.userLib.db.query(`UPDATE server SET upTime = ?, upCount = upCount + ${0x8 & data.status ? '1 + ' : ''}boost + 1 , online = ?, members = ?, ownerID = ? WHERE id = ?`, [now, msg.guild.members.filter(m => m.presence.status != 'offline' && !m.user.bot).array().length, msg.guild.memberCount, msg.guild.ownerID, msg.guild.id], () => {});

	client.userLib.sendlog(`{Guild UP} Ups "${data.upCount + data.boost + 1 + (0x8 & data.status ? 1 : 0)}", User "${msg.author.tag}"(ID: ${msg.author.id}), Guild "${msg.guild}" (ID: ${msg.guild.id}), Channel "${msg.channel.name}"(ID: ${msg.channel.id})`);

	embed = new client.userLib.discord.RichEmbed()
		.setTitle('Сервер Up')
		.setColor('#79D60F')
		.setTimestamp()
		.setFooter(msg.author.tag)
		.setDescription(`Нравится сервер?\nОцени его на [сайте](https://server-discord.com/${msg.guild.id})!`);
		
	if (data.boost > 0) {
	  let place = await client.userLib.promise(client.userLib.db, client.userLib.db.query, 'SET @row_number = 0');
	  place = await client.userLib.promise(client.userLib.db, client.userLib.db.queryCol, 'SELECT num FROM (SELECT (@row_number:=@row_number + 1) AS num, id FROM server ORDER BY upCount DESC, upTime ASC) AS temp WHERE id = ?', [msg.guild.id]);
	  place = place.res;
	  
		embed.addField('Буст информация', `Место на сайте: **${place}**\nКол-во Апов: **${data.upCount + data.boost + 1 + (0x8 & data.status ? 1 : 0)}**`)
			.addField('Бонусы', `Бонус за ${boosts[data.boost - 1]} буст: **+${data.boost}**${0x8 & data.status ? '\nБонус за Фаворитку: **+1**' : ''}`);
	}

	if (msg.guild.id == '577798137230655508')
		embed.addField('Буст информация', `Место на сайте: **0**\nКол-во Апов: **9999**`)
			.addField('Бонусы', `Бонус за Unlimited буст: **+9999**`);

	setTimeout(() => client.userLib.cooldown.delete(msg.guild.id), 1 * 1000);

	msg.channel.send({embed});

	client.userLib.db.query('INSERT INTO sdcstat (date, ups) VALUES (?, 1) ON DUPLICATE KEY UPDATE ups = ups + 1', [new Date]);
};