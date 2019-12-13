module.exports = async (client, guild) => {

	let black = (await client.userLib.promise(client.userLib.db, client.userLib.db.queryValue, 'SELECT COUNT(*) FROM blacklist WHERE id = ? AND warns > 2', [guild.id])).res;
	if (black) {guild.leave(); return;}

	let result = (await client.userLib.promise(client.userLib.db, client.userLib.db.count, 'server', {id: guild.id})).res;
	if (!result) {guild.leave(); return;}

	client.userLib.db.query('UPDATE server SET bot = 1, members = ?, online = ?, ownerID = ? WHERE id = ?', [guild.memberCount, guild.members.filter(m => m.presence.status == 'online' && !m.user.bot).size, guild.ownerID, guild.id], () => {});

	let embed = new client.userLib.discord.RichEmbed()
		.setAuthor('Новый сервер!')
		.setTitle(guild.name + ` (ID : ${guild.id})`)
		.setThumbnail(guild.iconURL)
		.setColor('#43B581')
		.addField('Участников/Онлайн', `${guild.memberCount} / ${guild.members.filter(m => m.presence.status == 'online' && !m.user.bot).size}`)
		.addField('Владелец сервера', `${guild.owner ? guild.owner.user.tag : 'NULL#0000'} (ID: ${guild.ownerID})`)
		.addField('Регион сервера', guild.region)
		.setTimestamp()
		.setFooter(`Добавился`);
	client.userLib.logc.send(embed);

	let all = await client.shard.fetchClientValues('guilds.size');
	all = all.reduce((prev, val) => prev + val, 0) - 1;
	client.userLib.db.query('INSERT INTO sdcstat (date, added, guilds) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE added = added + 1, guilds = ?', [new Date, all, all]);

};