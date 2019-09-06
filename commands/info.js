exports.help = {
	flag: 0,
	args: 0
}

exports.run = async (client, msg) => {
	let emojis;

	let place = await client.userLib.promise(client.userLib.db, client.userLib.db.query, 'SET @row_number = 0');
	place = await client.userLib.promise(client.userLib.db, client.userLib.db.queryCol, 'SELECT num FROM (SELECT (@row_number:=@row_number + 1) AS num, id FROM server ORDER BY upCount DESC, upTime ASC) AS temp WHERE id = ?', [msg.guild.id]);
	place =  place.res;

	let rating = (await client.userLib.promise(client.userLib.db, client.userLib.db.queryValue, 'SELECT SUM(rate) FROM rating WHERE servId = ?', [msg.guild.id])).res;

	let commentsCount = (await client.userLib.promise(client.userLib.db, client.userLib.db.queryValue, 'SELECT COUNT(*) FROM comments WHERE servId = ?', [msg.guild.id])).res;

	let data = await client.userLib.promise(client.userLib.db, client.userLib.db.queryRow, 'SELECT upCount, boost, boostTime, status, upTime FROM server LEFT JOIN boost using(id) WHERE id = ?', [msg.guild.id]);
	data = data.res;

	if (data.status) {emojis = (await client.userLib.promise(client.userLib.db, client.userLib.db.query, 'SELECT idach, emoji FROM achivments', [msg.guild.id])).res;}

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
		.addField("Место на сайте", ":trophy:" + (msg.guild.id != '577798137230655508' ? place : 0), true)
		.addField("Владелец", "<:owner:616214109364551703>" + msg.guild.owner.user.tag, true)
		.addField("Рейтинг", `<:rating:608188324389322752> ${rating ? rating : 0}`, true)
		.addField("Количество апов", "<:ups:616214109829988352>" + (msg.guild.id != '577798137230655508' ? data.upCount : 9999), true);

	if (msg.guild.id == '577798137230655508') embed.addField("До Up", "<:ups:616214109829988352> 00:00:00", true);
	else embed.addField("До Up", "<:ups:616214109829988352> 0" + send.getUTCHours() + ':' + ('00' + send.getMinutes()).slice(-2) + ':' + ('00' + send.getSeconds()).slice(-2), true);
	
	let temp = new Date();
	temp.setMonth(temp.getDate() > 15 ? temp.getMonth() + 1 : temp.getMonth(), temp.getDate() > 15 ? 1 : 15);

	embed.setFooter(`Сброс Up очков через `+client.userLib.moment(temp, "ddd MMM DD YYYY HH:mm:ss GMT+Z").fromNow(), client.user.avatarURL);

	// embed.addField("Сброс Up очков", client.userLib.moment(temp, "ddd MMM DD YYYY HH:mm:ss GMT+Z").fromNow(), true);

	if (commentsCount) embed.addField("Количество комментариев", "<:comment:607941508120707082>" + commentsCount, true);

	if (data.boost != 0 && msg.guild.id != '577798137230655508') {
		let date = ('00' + data.boostTime.getDate()).slice(-2) + '.' + ('00' + (data.boostTime.getMonth() + 1)).slice(-2) + '.' + data.boostTime.getFullYear() + 'г., в ' + ('00' + data.boostTime.getHours()).slice(-2) + ':' + ('00' + data.boostTime.getMinutes()).slice(-2) + ' (МСК)';
		embed.addField("Буст", data.boost == 1 ? 'Light' : data.boost == 2 ? 'Pro' : data.boost == 3 ? 'Max' : '', true).addField("Буст заканчивается", date, true);
	}

	if (msg.guild.id == '577798137230655508') {
		embed.addField("Буст", 'Unlimited', true).addField("Буст заканчивается", '01.01.9999г., в 00:00 (МСК)', true);
	}

	if (data.status) {
		let pins = '';
		for (var i = 0, length = emojis.length; i < length; i++) {
			pins += data.status & parseInt((emojis[i].idach + ''), 16) ? emojis[i].emoji : '';
		}
		embed.addField("Значки сервера", pins);
	}

	msg.channel.send({embed});
}