import { Command, Argument } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class LoggingCommand extends Command {
	constructor() {
		super("logging", {
			aliases: ["logging", "logs", "log"],
			category: "Configuration",
			args: [
				{
					id: "action",
					type: "string",
				},
				{
					id: "channel",
					type: Argument.union("textChannel", "string"),
				},
			],
			description: "Changes the Logging Channel",

			userPermissions: ["MANAGE_GUILD"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		switch (args.action) {
			default:
				return message.channel.send(
					new MessageEmbed({
						title: "Logging",
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
								name: "`enable`",
								value: "Enable logging",
							},
							{
								name: "`disable`",
								value: "Disable logging",
							},
							{
								name: "`channel <value>`",
								value: "Channel to send logs into",
							},
						],
					})
				);
				break;
			case "enable":
				this.client.settings.set(message.guild!.id, "logging", true);

				return message.channel.send(
					new MessageEmbed({
						title: `${this.client.config.emojis.greenCheck} Enabled Logging`,
						description: "Logging has been enabled",
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						footer: {
							text: message.author.tag,
							icon_url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
					})
				);
				break;
			case "disable":
				this.client.settings.set(message.guild!.id, "logging", false);

				return message.channel.send(
					new MessageEmbed({
						title: `${this.client.config.emojis.greenCheck} Disabled Logging`,
						description: "Logging has been disabled",
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						footer: {
							text: message.author.tag,
							icon_url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
					})
				);
				break;
			case "channel":
				const oldChannel = this.client.settings.get(
					message.guild!.id,
					"loggingChannel",
					null
				);

				if (!args.channel)
					return message.channel.send(
						new MessageEmbed({
							title: "Current Logging Channel",
							description: oldChannel
								? `The current channel for logging is <#${oldChannel}>`
								: "There is no current channel for logging",
							color: message.guild?.me?.displayHexColor,
							timestamp: new Date(),
							footer: {
								text: message.author.tag,
								icon_url: message.author.displayAvatarURL({
									dynamic: true,
								}),
							},
						})
					);
				this.client.settings.set(
					message.guild!.id,
					"loggingChannel",
					args.channel.id
				);

				return message.channel.send(
					new MessageEmbed({
						title: `${this.client.config.emojis.greenCheck} Changed Logging Channel`,
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
								name: "Before",
								value: oldChannel ? `<#${oldChannel}>` : "None",
								inline: true,
							},
							{
								name: "After",
								value: args.channel,
								inline: true,
							},
						],
					})
				);
		}
	}
}
