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
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
				fields: [
					{
						name: "Total Guilds",
						value: `\`${await this.client.shard!.fetchClientValues(
							"guilds.cache.size"
						)}\``,
						inline: true,
					},
					{
						name: "Total Members",
						value: `\`${await this.client.shard!.fetchClientValues(
							"users.cache.size"
						)}\``,
						inline: true,
					},
					{
						name: "Current Shard",
						value: `\`${message.guild!.shardID + 1}\`/\`${
							this.client.shard?.count
						}\``,
						inline: true,
					},
					{
						name: "Memory",
						value: `${Math.round(used * 100) / 100}MB of ${
							os.totalmem() / 1024 / 1024
						}MB`,
						inline: true,
					},
					{ name: "Uptime", value: uptime, inline: true },
					{
						name: "Node.js Version",
						value: `\`${process.version}\``,
						inline: true,
					},
					{
						name: "Akairo Version",
						value: `\`v${
							require("../../../node_modules/discord-akairo/package.json")
								.version
						}\``,
						inline: true,
					},
					{
						name: "Discord.js Version",
						value: `\`v${
							require("../../../node_modules/discord.js/package.json")
								.version
						}\``,
						inline: true,
					},
					{
						name: "Bot Version",
						value: `\`v${
							require("../../../package.json").version
						}\``,
						inline: true,
					},
					{
						name: "Database",
						value: "MariaDB",
						inline: true,
					},
				],
			})
		);
	}
}
