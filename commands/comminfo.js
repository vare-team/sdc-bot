exports.help = {
	flag: 1,
	args: 1
}

exports.run = async (client, msg, args) => {

  if (!args[1]) return;

  let comm_data = (await client.userLib.promise(client.userLib.db, client.userLib.db.queryRow, 'SELECT * FROM comments LEFT JOIN users using(userId) WHERE commId = ?', [args[1]])).res;

  if (!comm_data) msg.reply('404');

  let serv_data = (await client.userLib.promise(client.userLib.db, client.userLib.db.queryValue, 'SELECT name FROM server WHERE id = ?', [comm_data.servId])).res;

  let embed = new client.userLib.discord.RichEmbed()
  .setTitle(serv_data)
  .setAuthor(comm_data.username, comm_data.avatar ? `https://cdn.discordapp.com/avatars/${comm_data.userId}/${comm_data.avatar + '.' + (comm_data.avatar.startsWith('a_') ? 'gif' : 'png')}` : `https://cdn.discordapp.com/embed/avatars/${+(comm_data.username.split('#')[1]) % 5}.png`)
  .setDescription(comm_data.text)
  .setTimestamp(comm_data.data)
  .setColor('#4E5D94')
  msg.channel.send(embed);

}