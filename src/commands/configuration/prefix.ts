import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class PrefixCommand extends Command {
	constructor() {
		super("prefix", {
			aliases: ["prefix"],
			category: "Configuration",
			args: [
				{
					id: "prefix",
					type: "string",
				},
			],
			description: "Change my prefix",
			userPermissions: ["MANAGE_GUILD"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		// The third param is the default.
		const oldPrefix = this.client.settings.get(
			message.guild!.id,
			"prefix",
			this.client.config.prefix,
		);

		if (!args.prefix) {
			return message.channel.send({
				embeds: [
					this.embed(
						{
							title: `Current Prefix`,
							fields: [
								{
									name: "Prefix",
									value: `\`${oldPrefix}\``,
								},
							],
						},
						message,
					),
				],
			});
		}

		await this.client.settings.set(
			message.guild!.id,
			"prefix",
			args.prefix,
		);

		message.channel.send({
			embeds: [
				this.embed(
					{
						title: `${this.client.emoji.greenCheck} Changed Prefix`,
						fields: [
							{
								name: "Before",
								value: `\`${oldPrefix}\``,
								inline: true,
							},
							{
								name: "After",
								value: `\`${args.prefix}\``,
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
