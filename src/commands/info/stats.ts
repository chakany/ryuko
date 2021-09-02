import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import os from "os";
import ms from "ms";

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
		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: `${this.client.user!.username}'s Stats`,
						fields: [
							{
								name: "Total Servers",
								value: `\`${(
									await this.client.shard!.fetchClientValues(
										"guilds.cache.size"
									)
								).reduce(
									(acc: any, guildCount: any) =>
										acc + guildCount,
									0
								)}\``,
								inline: true,
							},
							{
								name: "Total Members",
								value: `\`${(
									await this.client.shard!.fetchClientValues(
										"users.cache.size"
									)
								).reduce(
									(acc: any, memberCount: any) =>
										acc + memberCount,
									0
								)}\``,
								inline: true,
							},
							{
								name: "Total Shards",
								value: `\`${this.client.shard?.count}\``,
								inline: true,
							},
							{
								name: "Memory",
								value: `${Math.round(used * 100) / 100}MB of ${
									os.totalmem() / 1024 / 1024
								}MB`,
								inline: true,
							},
							{
								name: "Uptime",
								value: ms(this.client.uptime!, { long: true }),
								inline: true,
							},
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
					},
					message
				),
			],
		});
	}
}
