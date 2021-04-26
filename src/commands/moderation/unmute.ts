import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

const args = [
	{
		id: "user",
		type: "member",
	},
];

export default class MoveCommand extends Command {
	protected args = args;

	constructor() {
		super("unmute", {
			aliases: ["unmute"],
			category: "Moderation",
			description: "Unmute a member",
			clientPermissions: ["MOVE_MEMBERS"],
			channel: "guild",
			args: args,
			modOnly: true,
		});
	}

	exec(message: Message, args: any): any {
		if (!args.user)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Argument",
					"You must provide a member to unmute!"
				)
			);

		const mutedMembers = this.client.jobs.get(message.guild!.id);
		if (!mutedMembers?.get(args.user.id))
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Usage",
					"That user is not currently muted!"
				)
			);

		mutedMembers.delete(args.user.id);

		this.client.jobs.set(message.guild!.id, mutedMembers);

		message.channel.send(
			new MessageEmbed({
				title: "Member Unmuted",
				description: `Successfully unmuted ${args.user}`,
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
			})
		);
		const logChannel = this.client.settings.get(
			message.guild!.id,
			"loggingChannel",
			null
		);

		if (logChannel)
			message
				.guild!.channels.cache.get(`${logChannel}`)
				// @ts-ignore
				?.send(
					new MessageEmbed({
						title: "Member Unmuted",
						description: `${args.user} has been unmuted by ${message.author}.`,
						color: 16716032,
						timestamp: new Date(),
						footer: {
							text: this.client.user?.tag,
							icon_url: this.client.user?.avatarURL({ dynamic: true }) || "",
						},
					})
				);
	}
}
