module.exports = (client, member) => {
	if (member.guild.id != '577798137230655508') return;

	client.userLib.logc.send(`Новый участник:\n${member.user} (tag: ${member.user.tag}) (ID: ${member.id})`);
};