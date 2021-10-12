import { Argument } from "@ryukobot/discord-akairo";
import Command from "../../struct/Command";
import { Message, User } from "discord.js";

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
						"Invalid Arguments",
						"You must provide a user to disconnect!",
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
						"The person you are trying to disconnect is not in a voice channel!",
					),
				],
			});

		const oldChannel = args.member.voice.channel;
		args.member.voice.setChannel(null);
		args.member.user.send({
			embeds: [
				this.embed(
					{
						title: "Disconnected Member",
						fields: [
							{
								name: "Member",
								value: args.member.toString(),
								inline: true,
							},
							{
								name: "Disconnected By",
								value: message.member!.toString(),
								inline: true,
							},
							{
								name: "From",
								value: oldChannel.toString(),
							},
							{
								name: "Reason",
								value: args.reason
									? `\`${args.reason}\``
									: "None",
							},
						],
					},
					message,
				),
			],
		});

		this.client.sendToLogChannel(message.guild!, "voice", {
			embeds: [
				this.embed(
					{
						title: "Member Disconnected from VC",
						thumbnail: {
							url: args.member.user.displayAvatarURL({
								dynamic: true,
							}),
						},
						footer: {},
						fields: [
							{
								name: "Member",
								value: args.member.toString(),
								inline: true,
							},
							{
								name: "Disconnected By",
								value: message.member!.toString(),
								inline: true,
							},
							{
								name: "From",
								value: oldChannel.toString(),
							},
							{
								name: "Reason",
								value: args.reason
									? `\`${args.reason}\``
									: "None",
							},
						],
					},
					message,
				),
			],
		});
	}
}
