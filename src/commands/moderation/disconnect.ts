import { Command, Argument } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class DisconnectCommand extends Command {
	constructor() {
		super("disconnect", {
			aliases: ["disconnect"],
			category: "Moderation",
			description: "Disconnect users that are in a channel",
			clientPermissions: ["MOVE_MEMBERS"],
			userPermissions: ["MOVE_MEMBERS"],

			args: [
				{
					id: "user",
					type: Argument.product("memberMention", "string"),
				},
				{
					id: "reason",
					type: "string",
				},
			],
			modOnly: true,
		});
	}

	exec(message: Message, args: any): any {
		try {
			// Check if the user is valid
			if (!args.user)
				return message.channel.send(
					this.client.error(
						message,
						this,
						"Invalid Argument",
						"You must provide a user to disconnect!"
					)
				);
			const victim = args.user[0];

			// Checks if the user is in a voice channel
			if (!victim.voice.channel)
				return message.channel.send(
					this.client.error(
						message,
						this,
						"Invalid Usage",
						"The person you are trying to disconnect is not in a channel!"
					)
				);

			const oldChannel = args.user[0].voice.channel;
			victim.voice.setChannel(null);
			const sendEmbed = new MessageEmbed({
				title: "You have been disconnected by a mod",
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
						value: "`" + oldChannel.name + "`",
						inline: true,
					},
					{
						name: "By",
						value: message.author,
						inline: true,
					},
				],
			});
			if (args.reason)
				sendEmbed.addField(
					"Reason",
					"`" +
						message.util!.parsed?.content?.replace(
							args.user[1],
							""
						) +
						"`",
					true
				);
			else sendEmbed.addField("Reason", "None Provided", true);
			victim.user.send(sendEmbed);

			const logchannel = this.client.settings.get(
				message.guild!.id,
				"loggingChannel",
				null
			);
			if (
				!logchannel ||
				!this.client.settings.get(message.guild!.id, "logging", false)
			)
				return;
			const logEmbed = new MessageEmbed({
				title: "Disconnection",
				thumbnail: {
					url: victim.user.displayAvatarURL({
						dynamic: true,
					}),
				},
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				fields: [
					{
						name: "From",
						value: oldChannel,
						inline: true,
					},
					{
						name: "Member",
						value: victim,
						inline: true,
					},
					{
						name: "Disconnected By",
						value: message.member,
					},
				],
			});
			if (args.reason)
				logEmbed.addField(
					"Reason",
					"`" +
						message.util!.parsed?.content?.replace(
							args.user[1],
							""
						) +
						"`",
					true
				);
			else logEmbed.addField("Reason", "None Provided", true);
			return (
				// @ts-ignore
				this.client.channels.cache
					.get(logchannel)
					// @ts-ignore
					.send(logEmbed)
			);
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				this.client.error(
					message,
					this,
					"An error occurred",
					error.message
				)
			);
		}
	}
}
