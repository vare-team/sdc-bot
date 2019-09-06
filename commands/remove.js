exports.help = {
	flag: 1,
	args: 1
}

exports.run = async (client, msg, args) => {

	let guildid = await client.rest.makeRequest('get', client.userLib.discord.Constants.Endpoints.Guild(args[1]).toString(), true);
	guildid = new client.userLib.discord.Guild(client, guildid);

	guildid.leave();

	client.userLib.db.delete('server', {id: args[1]}, (err, affectedRows) => {console.dir({delete:affectedRows}); 
		const embed = new client.userLib.discord.RichEmbed().setAuthor(`Успешно! Сервер ${guildid.name} удален!`, "https://cdn.discordapp.com/attachments/470556903718649856/470557142672343040/ping.png").setColor('#86FF00').setTimestamp().setFooter(msg.author.tag); 
		msg.reply({embed});
	});	
}