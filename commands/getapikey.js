function makeid() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

exports.help = {
	flag: 0,
	args: 0
};

exports.run = async (client, msg) => {
	/*if (Object.keys(client.userLib.admins).indexOf(msg.author.id) == -1) {
		console.log(msg.author.tag);
		let data = (await client.userLib.promise(client.userLib.db, client.userLib.db.queryValue, 'SELECT status FROM server WHERE id = ?', [msg.guild.id])).res;

		if (!(0x40 & data)) return msg.reply('Я тебя не знаю. Уходи.');
		if (msg.author.id != msg.guild.ownerID) return msg.reply('А ты кто?');
	}

	let temp = makeid();
	let embed = new client.userLib.discord.RichEmbed().setAuthor('DEV.Key').setDescription(`Для вашего сервера **${msg.guild.name}** был сгенерирован ключ разработчика!`).addField('Ключ:', `||${temp}||`).setTimestamp().setColor('#43B581').setFooter('Никому не сообщайте этот ключ!');
	
	client.userLib.db.query('INSERT INTO developers (id, dKey) VALUES (?, ?) ON DUPLICATE KEY UPDATE dKey = ?', [msg.guild.id, temp, temp], () => {msg.guild.owner.send(embed)});
 	client.userLib.db.upsert('developers', {id: msg.guild.id, dKey: temp}, () => {msg.author.send(embed)});
	 */
};