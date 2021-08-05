import { Argument } from "discord-akairo";
import Command from "../../struct/Command";
import { Message, MessageEmbed, GuildMember } from "discord.js";

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
					id: "member",
					type: "member",
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
		// Check if the user is valid
		if (!args.member)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You must provide a user to disconnect!"
				)
			);

		// Checks if the user is in a voice channel
		if (!args.member.voice.channel)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Usage",
					"The person you are trying to disconnect is not in a channel!"
				)
			);

		const oldChannel = args.member.voice.channel;
		args.member.voice.setChannel(null);
		const sendEmbed = new MessageEmbed({
			title: "Disconnected",
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
					value: oldChannel,
					inline: true,
				},
				{
					name: "By",
					value: message.author,
					inline: true,
				},
				{
					name: "Reason",
					value: args.reason
						? `\`${args.reason}\``
						: "No reason given",
				},
			],
		});
		args.member.user.send(sendEmbed);

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
				url: args.member.user.displayAvatarURL({
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
					value: args.member,
					inline: true,
				},
				{
					name: "Disconnected By",
					value: message.member,
					inline: true,
				},
				{
					name: "Reason",
					value: args.reason
						? `\`${args.reason}\``
						: "No reason given",
				},
			],
		});

		return (
			// @ts-ignore
			this.client.channels.cache
				.get(logchannel)
				// @ts-ignore
				?.send(logEmbed)
		);
	}
}
