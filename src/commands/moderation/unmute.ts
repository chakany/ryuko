import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

export default class MoveCommand extends Command {
	constructor() {
		super("unmute", {
			aliases: ["unmute"],
			category: "Moderation",
			description: "Unmute a member",
			clientPermissions: ["MOVE_MEMBERS"],
			channel: "guild",
			args: [
				{
					id: "user",
					type: "member",
				},
			],
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
		const muteRole = this.client.settings.get(
			message.guild!.id,
			"muteRole",
			null
		);
		if (!muteRole)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Configuration",
					`You must have a muted role set!\n+ Use ${
						message.util?.parsed?.prefix
					}${this.handler.findCommand("muterole").aliases[0]} to set one.`
				)
			);

		args.user.roles.remove(message.guild?.roles.cache.get(muteRole));
		mutedMembers.get(args.user.id)?.cancel();
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
