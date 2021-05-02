import { Command, Argument } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

const arg = [
	{
		id: "channel",
		type: Argument.union("textChannel", "string"),
	},
];

export default class LoggingCommand extends Command {
	protected args = arg;

	constructor() {
		super("logging", {
			aliases: ["logging", "log", "logchannel", "loggingchannel"],
			category: "Configuration",
			args: arg,
			description: "Changes the Logging Channel",
			channel: "guild",
			userPermissions: ["ADMINISTRATOR"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (args.channel === "disable" || args.channel === "off") {
			this.client.settings.set(message.guild!.id, "loggingChannel", null);
			return message.channel.send(
				new MessageEmbed({
					title: "Disabled Logging",
					color: 16716032,
					description: "Logging is now **off**",
					timestamp: new Date(),
					author: {
						name: message.author.tag,
						icon_url: message.author.avatarURL({ dynamic: true }) || "",
					},
					footer: {
						text: message.client.user?.tag,
						icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
					},
				})
			);
		}
		const prefix = message.util?.parsed?.prefix;

		// The third param is the default.
		const currentChannel = this.client.settings.get(
			message.guild!.id,
			"loggingChannel",
			"None"
		);

		if (!args.channel && currentChannel !== "None") {
			return message.channel.send(
				new MessageEmbed({
					title: "Current Logging Channel",
					color: 16716032,
					description: "`" + currentChannel + "`",
					timestamp: new Date(),
					author: {
						name: message.author.tag,
						icon_url: message.author.avatarURL({ dynamic: true }) || "",
					},
					footer: {
						text: message.client.user?.tag,
						icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
					},
				})
			);
		} else if (!args.channel && currentChannel === "None") {
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Configuration",
					"There is no logging channel set."
				)
			);
		}

		await this.client.settings.set(
			message.guild!.id,
			"loggingChannel",
			args.channel.id
		);
		return message.channel.send(
			new MessageEmbed({
				title: ":white_check_mark: Changed Logging Channel",
				color: 16716032,
				timestamp: new Date(),
				author: {
					name: message.author.tag,
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				footer: {
					text: message.client.user?.tag,
					icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
				},
				fields: [
					{
						name: "From",
						value: "`" + currentChannel + "`",
						inline: true,
					},
					{
						name: "To",
						// @ts-ignore
						value: "`" + args.channel.id + "`",
						inline: true,
					},
				],
			})
		);
	}
}
