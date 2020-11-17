const dateUtil = require("../utils/date");

module.exports = (bot) => () => {
	console.log(dateUtil(new Date()) + " | Shard is ready! Id is: " + bot.shard.ids);
};
