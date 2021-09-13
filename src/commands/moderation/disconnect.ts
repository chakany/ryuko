import { Argument } from "@ryukobot/discord-akairo";
import Command from "../../struct/Command";
import { Message, MessageEmbed, User } from "discord.js";

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
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must provide a user to disconnect!"
					),
				],
			});

		// Checks if the user is in a voice channel
		if (!args.member.voice.channel)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"The person you are trying to disconnect is not in a channel!"
					),
				],
			});

		const oldChannel = args.member.voice.channel;
		args.member.voice.setChannel(null);
		args.member.user.send({
			embeds: [
				this.embed(
					{
						title: "Disconnected",
						fields: [
							{
								name: "From",
								value: oldChannel.toString(),
								inline: true,
							},
							{
								name: "By",
								value: message.author.toString(),
								inline: true,
							},
							{
								name: "Reason",
								value: args.reason
									? `\`${args.reason}\``
									: "No reason given",
							},
						],
					},
					message
				),
			],
		});

		this.client.sendToLogChannel(
			{
				embeds: [
					this.embed(
						{
							title: "Disconnection",
							thumbnail: {
								url: args.member.user.displayAvatarURL({
									dynamic: true,
								}),
							},
							footer: {},
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
						},
						message
					),
				],
			},
			message.guild!
		);
	}
}
