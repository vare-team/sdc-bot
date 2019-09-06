module.exports = (client, oldGuild, newGuild) => {
	if (!newGuild.available) return;
	if (oldGuild.iconURL != newGuild.iconURL || oldGuild.name != newGuild.name || oldGuild.ownerID != newGuild.ownerID) {
		client.userLib.db.update('server', {id: newGuild.id, name: newGuild.name, avatar: newGuild.icon ? newGuild.icon : '/img/Logo.svg', owner: newGuild.owner ? newGuild.owner.user.tag : 'NULL#0000', online: newGuild.members.filter(m => m.presence.status != 'offline' && !m.user.bot).size, members: newGuild.memberCount, ownerID: newGuild.ownerID}, () => {});
	}
};