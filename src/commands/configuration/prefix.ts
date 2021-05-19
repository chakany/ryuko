import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class PrefixCommand extends Command {
	constructor() {
		super("prefix", {
			aliases: ["prefix"],
			category: "Configuration",
			args: [
				{
					id: "prefix",
					type: "string",
				},
			],
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
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You must provide a prefix to use!"
				)
			);
		}

		await this.client.settings.set(
			message.guild!.id,
			"prefix",
			args.prefix
		);
		message.channel.send(
			new MessageEmbed({
				title: ":white_check_mark: Changed Prefix",
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
