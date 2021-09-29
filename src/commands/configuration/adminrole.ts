import Command from "../../struct/Command";
import { Message } from "discord.js";
import { roleMention } from "@discordjs/builders";

export default class AdminroleCommand extends Command {
	constructor() {
		super("adminrole", {
			aliases: ["adminrole"],
			category: "Configuration",
			args: [
				{
					id: "role",
					type: "role",
				},
			],
			description: "Change the Admin Role",
			userPermissions: ["MANAGE_GUILD"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const prefix = message.util?.parsed?.prefix;

		// The third param is the default.
		const currentRole = this.client.settings.get(
			message.guild!.id,
			"adminRole",
			null,
		);

		if (!args.role && currentRole) {
			return message.channel.send({
				embeds: [
					this.embed(
						{
							title: "Current Admin Role",
							fields: [
								{
									name: "Role",
									value: currentRole
										? roleMention(currentRole)
										: "None",
								},
							],
						},
						message,
					),
				],
			});
		} else if (!args.role && !currentRole) {
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Configuration",
						`There is no Admin Role set, use the \`${prefix}${message.util?.parsed?.alias}\`command to set it.`,
					),
				],
			});
		}

		await this.client.settings.set(
			message.guild!.id,
			"adminRole",
			args.role.id,
		);
		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: `${this.client.emoji.greenCheck} Changed Admin Role`,
						fields: [
							{
								name: "Before",
								value: currentRole
									? roleMention(currentRole)
									: "None",
								inline: true,
							},
							{
								name: "After",
								value: args.role.toString(),
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
