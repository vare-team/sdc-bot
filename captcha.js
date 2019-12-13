const jimp = require("jimp");

module.exports = async (Discord, msgchan, msgauth, captchaType = 'image') => {

	let captcha = Math.random().toString().substr(2, 4);

	if (captchaType == "image") {

		let _image = await jimp.read("./captcha.png");
		_image.resize(375, 100); // make bigger
		_image.print(await jimp.loadFont(jimp.FONT_SANS_64_BLACK), Math.random() * 160, Math.random() * 53, captcha); // print captcha on image
		_image.getBuffer(jimp.MIME_PNG, (err, buff) => msgchan.send('Введите код с картинки', new Discord.Attachment(buff, "captcha.png")).then(captmsg => captmsg.delete(15000).catch(() => {})) );

	} else if (captchaType == "text") { msgchan.send(`Напишите код ниже в этот канал \n \`\`${captcha}\`\``);}

	let flag = await msgchan.awaitMessages(message => message.author == msgauth, {max: 1, time: 15 * 1000, errors: ["time"]}).catch(() => 0);
	if (flag) {
		// flag = flag.first().content == "." + captcha ? 1 : 0;
		flag = flag.first().content == captcha ? 1 : 0;
	}

	return flag ? 1 : 0;
};