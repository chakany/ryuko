import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class DragCommand extends Command {
	constructor() {
		super("drag", {
			aliases: ["drag"],
			category: "Moderation",
			description: "Drag other members into your own channel",
			clientPermissions: ["MOVE_MEMBERS"],
			userPermissions: ["MOVE_MEMBERS"],
			args: [
				{
					id: "member",
					type: "member",
				},
			],
			modOnly: true,
		});
	}

	exec(message: Message, args: any): any {
		const victim = args.member;

		// Get the mentioned user
		const Channel = message.member!.voice.channel;
		// Check if the user is valid
		if (!victim)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must provide a user to drag!"
					),
				],
			});

		// Check if the channel is valid
		if (!Channel)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"You must be inside a voice channel!"
					),
				],
			});

		// Checks if the user is in a voice channel
		if (!victim.voice.channel)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"The person you are trying to drag is not in a channel!"
					),
				],
			});

		const oldChannel = args.member.voice.channel;
		victim.voice.setChannel(Channel);

		this.client.sendToLogChannel(
			{
				embeds: [
					this.embed(
						{
							title: "Drag",
							thumbnail: {
								url: victim.user.displayAvatarURL({
									dynamic: true,
								}),
							},
							footer: {},
							fields: [
								{
									name: "From",
									value: oldChannel.toString(),
									inline: true,
								},
								{
									name: "To",
									value: Channel.toString(),
									inline: true,
								},
								{
									name: "Member",
									value: args.member.toString(),
								},
								{
									name: "Dragged By",
									value: message.member!.toString(),
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
