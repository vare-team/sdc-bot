const links = {
	vk: {
		url: 'https://vk.com/',
		color: '#4680C2',
		name: 'ВКонтакте',
		icon: 'https://pngimg.com/uploads/vkontakte/vkontakte_PNG25.png'
	},
	youtube: {
		url: 'https://youtube.com/',
		color: '#E32C26',
		name: 'YouTube',
		icon: 'https://pngimg.com/uploads/youtube/youtube_PNG15.png'
	},
	twitch: {
		url: 'https://twitch.tv/',
		color: '#5A3E85',
		name: 'Twitch.TV',
		icon: 'https://pngimg.com/uploads/twitch/twitch_PNG48.png'
	},
	steam: {
		url: 'https://steamcommunity.com/',
		color: '#1B2838',
		name: 'Steam',
		icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/1200px-Steam_icon_logo.svg.png'
	},
	instagram: {
		url: 'https://instagram.com/',
		color: '#e1306c',
		name: 'Instagram',
		icon: 'https://instagram-brand.com/wp-content/uploads/2016/11/Instagram_AppIcon_Aug2017.png?w=300'
	},
	website: {
		url: 'https://',
		color: '#7289DA',
		name: 'Сайт',
		icon: 'https://pre00.deviantart.net/1c30/th/pre/f/2015/120/b/7/project_spartan_by_dtafalonso-d8pjme5.png'
	}
}

exports.help = {
	flag: 0,
	args: 1
}

exports.run = async (client, msg, args) => {

	args[1] = args[1].toLowerCase();

	if (['vk', 'youtube', 'twitch', 'steam', 'instagram', 'website'].indexOf(args[1]) == -1) return msg.reply('Не, так не пойдет!');

	let data = await client.userLib.promise(client.userLib.db, client.userLib.db.queryValue, 'SELECT ?? FROM userUrls WHERE id = ?', [args[1], msg.guild.id]);
	data = data['res'];
	if (!data) return msg.reply('У сервера отсутствует такая привязка!');

	let embed = new client.userLib.discord.RichEmbed()
	.setAuthor(links[args[1]].name, links[args[1]].icon, links[args[1]].url + data)
	.setColor(links[args[1]].color)
	.setFooter(msg.guild.name, msg.guild.iconURL);

	msg.channel.send(embed);
}