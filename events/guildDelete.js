module.exports = async (client, guild) => {
  
  let result = (await client.userLib.promise(client.userLib.db, client.userLib.db.count, 'server', {id: guild.id})).res;
  if (!result) {return;}
  
  client.userLib.db.query(`UPDATE server SET bot = 0 WHERE id = ?`, [guild.id], () => {});
  
  let embed = new client.userLib.discord.RichEmbed()
  .setAuthor('Сервер удалил бота!')
  .setTitle(guild.name + ` (ID : ${guild.id})`)
  .setThumbnail(guild.iconURL)
  .setColor('#F04747')
  .addField('Участников/Онлайн', `${guild.memberCount} / ${guild.members.filter(m => m.presence.status == 'online' && !m.user.bot).size}`)
  .addField('Владелец сервера', `${guild.owner ? guild.owner.user.tag : 'NULL#0000'} (ID: ${guild.ownerID})`)
  .setTimestamp()
  .setFooter(`Удалился`);
  
  client.userLib.logc.send(embed);

  let all = await client.shard.fetchClientValues('guilds.size');
  all = all.reduce((prev, val) => prev + val, 0) - 1;
  client.userLib.db.query('INSERT INTO sdcstat (date, removed, guilds) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE removed = removed + 1, guilds = ?', [new Date, all, all]);
  
};