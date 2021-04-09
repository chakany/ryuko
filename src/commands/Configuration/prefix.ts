import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

const arg = [
	{
		id: "prefix",
		type: "string",
	},
];

export default class PrefixCommand extends Command {
	protected args = arg;

	constructor() {
		super("prefix", {
			aliases: ["prefix"],
			category: "Configuration",
			args: arg,
			description: "Change the prefix of the bot",
			channel: "guild",
			userPermissions: ["ADMINISTRATOR"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		// The third param is the default.
		const oldPrefix = this.client.settings.get(
			message.guild!.id,
			"prefix",
			"!"
		);

		if (!args.prefix) {
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Argument",
					"You must provide a prefix to use!"
				)
			);
		}

		await this.client.settings.set(message.guild!.id, "prefix", args.prefix);
		message.channel.send(
			new MessageEmbed({
				title: ":white_check_mark: Changed Prefix",
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
						value: "`" + oldPrefix + "`",
						inline: true,
					},
					{
						name: "To",
						// @ts-ignore
						value: "`" + args.prefix + "`",
						inline: true,
					},
				],
			})
		);

		const logchannel = this.client.settings.get(
			message.guild!.id,
			"loggingChannel",
			"None"
		);
		if (logchannel === "None") return;
		return (
			// @ts-ignore
			this.client.channels.cache
				.get(logchannel)
				// @ts-ignore
				.send(
					new MessageEmbed({
						title: "Prefix Changed",
						color: 16716032,
						timestamp: new Date(),
						author: {
							name: message.author.tag + " (" + message.author.id + ")",
							icon_url: message.author.avatarURL({ dynamic: true }) || "",
						},
						footer: {
							text: message.client.user?.tag,
							icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
						},
						fields: [
							{
								name: "From",
								value: "`" + oldPrefix + "`",
								inline: true,
							},
							{
								name: "To",
								// @ts-ignore
								value: "`" + args.prefix + "`",
								inline: true,
							},
						],
					})
				)
		);
	}
}
