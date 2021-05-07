import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

export default class ModroleCommand extends Command {
	constructor() {
		super("muterole", {
			aliases: ["muterole"],
			category: "Configuration",
			args: [
				{
					id: "role",
					type: "role",
				},
			],
			description:
				"Changes the muted user role, this setting is required if you want to use the `mute` and `unmute` commands.",
			channel: "guild",
			userPermissions: ["ADMINISTRATOR"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const prefix = message.util?.parsed?.prefix;

		// The third param is the default.
		const currentRole = this.client.settings.get(
			message.guild!.id,
			"muteRole",
			"None"
		);

		if (!args.role && currentRole !== "None") {
			return message.channel.send(
				new MessageEmbed({
					title: "Current Mute Role",
					color: message.guild?.me?.displayHexColor,
					description: "`" + currentRole + "`",
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({ dynamic: true }),
					},
				})
			);
		} else if (!args.role && currentRole === "None") {
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Configuration",
					"There is no mute role set, use the `" +
						prefix +
						this.handler.findCommand("muterole").aliases[0] +
						"` to set it."
				)
			);
		}

		await this.client.settings.set(message.guild!.id, "muteRole", args.role.id);
		return message.channel.send(
			new MessageEmbed({
				title: ":white_check_mark: Changed Mute Role",
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
				fields: [
					{
						name: "From",
						value: "`" + currentRole + "`",
						inline: true,
					},
					{
						name: "To",
						// @ts-ignore
						value: "`" + args.role.id + "`",
						inline: true,
					},
				],
			})
		);
	}
}
