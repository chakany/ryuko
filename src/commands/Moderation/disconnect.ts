import { Command, Argument } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

const args = [
	{
		id: "user",
		type: Argument.product("memberMention", "string"),
	},
	{
		id: "reason",
		type: "string",
	},
];

export default class DisconnectCommand extends Command {
	protected args = args;
	protected modOnly = true;

	constructor() {
		super("disconnect", {
			aliases: ["disconnect"],
			category: "Moderation",
			description: "Disconnect users that are in a channel",
			clientPermissions: ["MOVE_MEMBERS"],
			channel: "guild",
			args: args,
		});
	}

	// @ts-ignore stupid issue over types and shit
	userPermissions(message: Message) {
		const modRole = this.client.settings.get(
			message.guild!.id,
			"modRole",
			null
		);
		if (
			modRole &&
			!message.member!.roles.cache.some((role) => role.id === modRole)
		) {
			return "roleId: " + modRole;
		} else if (!modRole) {
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Configuration",
					"To use mod commands, you must first set a mod role. See the configuration section in help for more info."
				)
			);
		}

		return null;
	}

	exec(message: Message, args: any): any {
		try {
			// Check if the user is valid
			if (!args.user)
				return message.channel.send(
					Error(
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
					Error(
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
				color: 16716032,
				timestamp: new Date(),
				footer: {
					text: message.client.user?.tag,
					icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
				},
				fields: [
					{
						name: "From",
						value: "`" + oldChannel.name + "`",
						inline: true,
					},
				],
			});
			if (args.reason)
				sendEmbed.addField(
					"Reason",
					"`" + message.util!.parsed?.content?.replace(args.user[1], "") + "`",
					true
				);
			else sendEmbed.addField("Reason", "None Provided", true);
			victim.user.send(sendEmbed);

			const logchannel = this.client.settings.get(
				message.guild!.id,
				"loggingChannel",
				"None"
			);
			if (logchannel === "None") return;
			const logEmbed = new MessageEmbed({
				title: "Disconnection",
				description:
					"`" + victim.user.tag + "` `" + victim.user.id + "` was disconnected",
				thumbnail: victim.user.avatarURL({ dynamic: true }),
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
				fields: [
					{
						name: "From",
						value: "`" + oldChannel.name + "`",
						inline: true,
					},
				],
			});
			if (args.reason)
				logEmbed.addField(
					"Reason",
					"`" + message.util!.parsed?.content?.replace(args.user[1], "") + "`",
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
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
}
