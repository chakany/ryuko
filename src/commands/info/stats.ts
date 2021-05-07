import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import fs from "fs";
import os from "os";

export default class PingCommand extends Command {
	constructor() {
		super("stats", {
			aliases: ["stats"],
			description: "Gets bot stats",
			category: "Info",
		});
	}

	async exec(message: Message) {
		const arr = [1, 2, 3, 4, 5, 6, 9, 7, 8, 9, 10];
		arr.reverse();
		const used = process.memoryUsage().heapUsed / 1024 / 1024;
		var date = new Date(<number>this.client.uptime);
		var uptime = "";
		uptime += date.getUTCDate() - 1 + " days, ";
		uptime += date.getUTCHours() + " hours, ";
		uptime += date.getUTCMinutes() + " minutes, ";
		uptime += date.getUTCSeconds() + " seconds, ";
		uptime += date.getUTCMilliseconds() + " milliseconds";
		return message.channel.send(
			new MessageEmbed({
				title: `${this.client.user!.username}'s Stats`,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
				description:
					"```asciidoc\n" +
					`Servers :: ${await this.client.shard!.fetchClientValues(
						"guilds.cache.size"
					)}\nShard :: ${message.guild?.shardID} of ${
						this.client.shard?.count
					}\nMemory :: ${Math.round(used * 100) / 100}MB of ${
						os.totalmem() / 1024 / 1024
					}MB\nUptime :: ${uptime}\nNode.js Version :: ${
						process.version
					}\nDiscord.js Version :: ${
						require("../../../node_modules/discord.js/package.json").version
					}\nAkairo Version :: ${
						require("../../../node_modules/discord-akairo/package.json").version
					}\nBot Version :: ${
						require("../../../package.json").version
					}\nDatabase :: MariaDB` +
					"```",
			})
		);
	}
}
