import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class MoveCommand extends Command {
	constructor() {
		super("unmute", {
			aliases: ["unmute"],
			category: "Moderation",
			description: "Unmute a member",
			clientPermissions: ["MANAGE_ROLES"],
			userPermissions: ["MANAGE_ROLES"],

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
				this.client.error(
					message,
					this,
					"Invalid Argument",
					"You must provide a member to unmute!"
				)
			);

		const mutedMembers = this.client.jobs.get(message.guild!.id);
		if (!mutedMembers?.get(args.user.id))
			return message.channel.send(
				this.client.error(
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
				this.client.error(
					message,
					this,
					"Invalid Configuration",
					`You must have a muted role set!\n+ Use ${
						message.util?.parsed?.prefix
					}${
						this.handler.findCommand("muterole").aliases[0]
					} to set one.`
				)
			);

		args.user.roles.remove(message.guild?.roles.cache.get(muteRole));
		mutedMembers.get(args.user.id)?.cancel();
		mutedMembers.delete(args.user.id);

		this.client.jobs.set(message.guild!.id, mutedMembers);

		this.client.db.unpunishMember(args.user.id, message.guild!.id, "mute");

		message.channel.send(
			new MessageEmbed({
				title: "Member Unmuted",
				description: `Successfully unmuted ${args.user}`,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				author: {
					name: message.author.tag + " (" + message.author.id + ")",
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
			})
		);
		const logChannel = this.client.settings.get(
			message.guild!.id,
			"loggingChannel",
			null
		);

		if (
			logChannel &&
			this.client.settings.get(message.guild!.id, "logging", false)
		)
			message
				.guild!.channels.cache.get(`${logChannel}`)
				// @ts-ignore
				?.send(
					new MessageEmbed({
						title: "Member Unmuted",
						description: `${args.user} has been unmuted by ${message.author}.`,
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
					})
				);
	}
}
