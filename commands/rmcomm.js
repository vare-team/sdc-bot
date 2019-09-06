exports.help = {
	flag: 1,
	args: 1
}

exports.run = async (client, msg, args) => {

  let data = await client.userLib.promise(client.userLib.db, client.userLib.db.queryRow, 'SELECT * FROM comments WHERE commId = ?', [args[1]]);

  client.userLib.db.delete('comments', {commId: args[1]}, (err, affectedRows) => {console.dir({delete:affectedRows})});
  
  console.log(data.userId, data.servId);
  // client.userLib.db.query('DELETE FROM rating WHERE userId = ? AND servId = ?', [data.userId, data.servId]);
    
  const embed = new client.userLib.discord.RichEmbed().setAuthor(`Успешно! Комментарий ${args[1]} удален!`, "https://cdn.discordapp.com/attachments/470556903718649856/470557142672343040/ping.png").setColor('#86FF00').setTimestamp().setFooter(msg.author.tag); 
  msg.reply(embed);
  
}