import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class MoveCommand extends Command {
	constructor() {
		super("move", {
			aliases: ["move", "drag"],
			category: "Moderation",
			description: "Move a Member into a different voice channel",
			clientPermissions: ["MOVE_MEMBERS"],
			userPermissions: ["MOVE_MEMBERS"],
			args: [
				{
					id: "member",
					type: "member",
				},
				{
					id: "channel",
					type: "voiceChannel",
					default: (message: Message) =>
						message.member!.voice?.channel,
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
						"You must provide a user to move!",
					),
				],
			});

		// Check if the channel is valid
		if (!args.channel)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"You must provide a voice channel, or be in one!",
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
						"The person you are trying to move is not in a voice channel!",
					),
				],
			});

		const oldChannel = args.member.voice.channel;
		args.member.voice.setChannel(args.channel);

		this.client.sendToLogChannel(message.guild!, "voice", {
			embeds: [
				this.embed(
					{
						title: "Member Moved VCs",
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
							},
							{
								name: "Moved By",
								value: message.member!.toString(),
							},
							{
								name: "From",
								value: oldChannel.toString(),
								inline: true,
							},
							{
								name: "To",
								value: args.channel.toString(),
								inline: true,
							},
						],
					},
					message,
				),
			],
		});
	}
}
