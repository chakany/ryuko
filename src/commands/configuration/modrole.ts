import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

export default class ModroleCommand extends Command {
	constructor() {
		super("modrole", {
			aliases: ["modrole"],
			category: "Configuration",
			args: [
				{
					id: "role",
					type: "role",
				},
			],
			description:
				"Changes the Mod Role, setting this is required if you want to use Moderation commands.",
			channel: "guild",
			userPermissions: ["ADMINISTRATOR"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const prefix = message.util?.parsed?.prefix;

		// The third param is the default.
		const currentRole = this.client.settings.get(
			message.guild!.id,
			"modRole",
			"None"
		);

		if (!args.role && currentRole !== "None") {
			return message.channel.send(
				new MessageEmbed({
					title: "Current Mod Role",
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
					"There is no mod role set, use the '" +
						prefix +
						"modrole' command to set it."
				)
			);
		}

		await this.client.settings.set(message.guild!.id, "modRole", args.role.id);
		return message.channel.send(
			new MessageEmbed({
				title: ":white_check_mark: Changed Mod Role",
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
