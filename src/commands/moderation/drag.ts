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
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You must provide a user to drag!"
				)
			);

		// Check if the channel is valid
		if (!Channel)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Usage",
					"You must be inside a voice channel!"
				)
			);

		// Checks if the user is in a voice channel
		if (!victim.voice.channel)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Usage",
					"The person you are trying to drag is not in a channel!"
				)
			);

		const oldChannel = args.member.voice.channel;
		victim.voice.setChannel(Channel);
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
		return (
			// @ts-ignore
			this.client.channels.cache
				.get(logchannel)
				// @ts-ignore
				?.send(
					new MessageEmbed({
						title: "Drag",
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						thumbnail: {
							url: victim.user.displayAvatarURL({
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
								name: "To",
								value: Channel,
								inline: true,
							},
							{
								name: "Member",
								value: args.member,
							},
							{
								name: "Dragged By",
								value: message.member,
							},
						],
					})
				)
		);
	}
}
