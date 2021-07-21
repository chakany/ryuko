import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

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
			this.client.config.prefix
		);

		if (!args.prefix) {
			return message.channel.send(
				new MessageEmbed({
					title: `Current Prefix`,
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
							name: "Prefix",
							value: `\`${oldPrefix}\``,
						},
					],
				})
			);
		}

		await this.client.settings.set(
			message.guild!.id,
			"prefix",
			args.prefix
		);

		message.channel.send(
			new MessageEmbed({
				title: `${this.client.config.emojis.greenCheck} Changed Prefix`,
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
						value: `\`${oldPrefix}\``,
						inline: true,
					},
					{
						name: "After",
						value: `\`${args.prefix}\``,
						inline: true,
					},
				],
			})
		);
	}
}
