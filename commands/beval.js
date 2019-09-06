function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
    return text;
}

const os = require('os')
    , fs = require('fs')
    , { PerformanceObserver, performance } = require('perf_hooks')
    , master = '166610390581641217'
    , mega = '321705723216134154'
    ;

exports.help = {
	flag: 1,
	args: 1
}

exports.run = (client, msg, args) => {
  let embed = new client.userLib.discord.RichEmbed().setAuthor('Исход: в процессе.').setColor('#FAA61A').setFooter(msg.author.tag);
  msg.channel.send(embed).then(msge => {
    let embededit = new client.userLib.discord.RichEmbed();
    args.shift();
    const code = args.join(" ");
    var t0 = performance.now();
    client.shard.broadcastEval(code)
    .then(evaled => {
      var t1 = performance.now();
      // if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
      embededit.setAuthor('Исход: успех!').setTitle('Результат:')
      .addField('Информация', `Код выполнился за \`\`${t1 - t0}\`\`мс.`)
      .setColor('#43B581')
      // .setColor(evaled.length > 2000 ? '#727C8A' : '#43B581')
      .setFooter(msg.author.tag)
      .addBlankField();
      for (var i = 0, length = client.shard.count; i < length; i++) {
        embededit.addField(`SHARD[${i}]`, evaled[i].length > 2000 ? 'Исход итерации занял более 2К символов!' : `\`\`\`Js\n${clean(require("util").inspect(evaled[i]))}\`\`\``);
      }
      msge.edit(embededit);
    })
    .catch(err => {
      embededit = new client.userLib.discord.RichEmbed().setAuthor('Исход: ошибка!').setTitle('Сообщение:').addField('Информация об ошибке', `Наименование: \`\`${err.name}\`\`\nСтрока: \`\`${err.lineNumber}\`\`\nПозиция: \`\`${err.columnNumber}\`\``).setColor('#F04747').setDescription(`\`\`${err.message}\`\``).setFooter(msg.author.tag);
      msge.edit(embededit);
    })

  });
}