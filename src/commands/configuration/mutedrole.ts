import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

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
			userPermissions: ["MANAGE_GUILD"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const prefix = message.util?.parsed?.prefix;

		// The third param is the default.
		const currentRole = this.client.settings.get(
			message.guild!.id,
			"muteRole",
			null
		);

		if (!args.role && currentRole) {
			return message.channel.send(
				new MessageEmbed({
					title: "Current Mute Role",
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
					fields: [
						{
							name: "Role",
							value: currentRole ? `<&${currentRole}>` : "None",
						},
					],
				})
			);
		} else if (!args.role && !currentRole) {
			return message.channel.send(
				this.client.error(
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

		await this.client.settings.set(
			message.guild!.id,
			"muteRole",
			args.role.id
		);

		return message.channel.send(
			new MessageEmbed({
				title: `${this.client.emoji.greenCheck} Changed Mute Role`,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
				fields: [
					{
						name: "Before",
						value: currentRole ? `<@&${currentRole}>` : "None",
						inline: true,
					},
					{
						name: "After",
						value: args.role,
						inline: true,
					},
				],
			})
		);
	}
}
