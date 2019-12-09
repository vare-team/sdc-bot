exports.help = {
	flag: 0,
	args: 0
}

exports.run = async (client, msg) => {

	await client.userLib.promise(client.userLib.db, client.userLib.db.query, 'SET @row_number = 0');

	let data = await client.userLib.promise(client.userLib.db, client.userLib.db.queryRow, `
		SELECT upCount, boost, boostTime, status, upTime, place, rating, comments FROM server 
		LEFT JOIN boost using(id) 
		LEFT JOIN (SELECT id, (@row_number:=@row_number + 1) AS place FROM server WHERE bot = 1 ORDER BY upCount DESC, upTime ASC) AS temp using(id) 
		LEFT JOIN (SELECT servId as id, SUM(rate) as rating FROM rating WHERE servId = ?) AS rating using(id)
		LEFT JOIN (SELECT servId as id, COUNT(*) as comments FROM comments WHERE servId = ?) AS comments using(id)
		WHERE id = ?`, [msg.guild.id, msg.guild.id, msg.guild.id]);
	data = data.res;

	if (msg.guild.id != '577798137230655508') {
		var send = new Date(4 * 3600000 - (Date.now() - data.upTime));
	}

	let embed = new client.userLib.discord.RichEmbed().setAuthor(`Информация ${msg.guild.name}`).setColor('#23272A')
		.setThumbnail(msg.guild.iconURL)
		.setDescription(`[Страница сервера](https://server-discord.com/${msg.guild.id})`)
		.addField("Участники", "<:user:616214109624467467>" + msg.guild.memberCount, true)
		.addField("В Сети", "<:online:616214109310156823>" + msg.guild.members.filter(m => m.presence.status == 'online' && !m.user.bot).size, true)
		.addField("АФК", "<:idle:616214107892219926>" + msg.guild.members.filter(m => m.presence.status == 'idle' && !m.user.bot).size, true)
		.addField("Не беспокоить", "<:dnd:616214108383215626>" + msg.guild.members.filter(m => m.presence.status == 'dnd' && !m.user.bot).size, true)
		.addField("Не в Сети", "<:offline:616214108043345921>" + msg.guild.members.filter(m => m.presence.status == 'offline' && !m.user.bot).size, true)
		.addField("Место на сайте", ":trophy:" + (msg.guild.id != '577798137230655508' ? data.place : 0), true)
		.addField("Владелец", "<:owner:616214109364551703>" + msg.guild.owner ? msg.guild.owner : 'Ошибка получения', true)
		.addField("Рейтинг", `<:rating:608188324389322752> ${data.rating ? data.rating : 0}`, true)
		.addField("Количество апов", "<:ups:616214109829988352>" + (msg.guild.id != '577798137230655508' ? data.upCount : 9999), true);

	if (msg.guild.id == '577798137230655508') embed.addField("До Up", "<:ups:616214109829988352> 00:00:00", true);
	else if ((4 * 3600000 - (Date.now() - data.upTime)) > 0) embed.addField("До Up", "<:ups:616214109829988352> 0" + send.getUTCHours() + ':' + ('00' + send.getMinutes()).slice(-2) + ':' + ('00' + send.getSeconds()).slice(-2), true);
	
	let temp = new Date();
	temp.setMonth(temp.getDate() > 15 || (temp.getDate() == 15 && temp.getHours() > 12) ? temp.getMonth() + 1 : temp.getMonth(), temp.getDate() > 15 || (temp.getDate() == 15 && temp.getHours() > 12) || (temp.getDate() == 1 && temp.getHours() < 12) ? 1 : 15);
	temp.setHours(12, 0);

	embed.setFooter('Сброс Up очков: '+client.userLib.moment(temp, "ddd MMM DD YYYY HH:mm:ss GMT+Z").fromNow(), client.user.avatarURL);

	// embed.addField("Сброс Up очков", client.userLib.moment(temp, "ddd MMM DD YYYY HH:mm:ss GMT+Z").fromNow(), true);

	if (data.comments) embed.addField("Количество комментариев", "<:comment:607941508120707082>" + data.comments, true);

	if (data.boost != 0 && msg.guild.id != '577798137230655508') {
		let date = ('00' + data.boostTime.getDate()).slice(-2) + '.' + ('00' + (data.boostTime.getMonth() + 1)).slice(-2) + '.' + data.boostTime.getFullYear() + 'г., в ' + ('00' + data.boostTime.getHours()).slice(-2) + ':' + ('00' + data.boostTime.getMinutes()).slice(-2) + ' (МСК)';
		embed.addField("Буст", data.boost == 1 ? 'Light' : data.boost == 2 ? 'Pro' : data.boost == 3 ? 'Max' : '', true).addField("Буст заканчивается", date, true);
	}

	if (msg.guild.id == '577798137230655508') {
		embed.addField("Буст", 'Unlimited', true).addField("Буст заканчивается", '01.01.9999г., в 00:00 (МСК)', true);
	}

	if (data.status) {
		let pins = '';
		for (var i = 0, length = client.userLib.emojis.length; i < length; i++) {
			pins += data.status & parseInt((client.userLib.emojis[i].idach + ''), 16) ? client.userLib.emojis[i].emoji : '';
		}
		embed.addField("Значки сервера", pins);
	}

	msg.channel.send({embed});
}