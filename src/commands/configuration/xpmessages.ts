import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class XpMessageCommand extends Command {
	constructor() {
		super("xpmessages", {
			aliases: ["xpmessages"],
			category: "Configuration",
			args: [
				{
					id: "value",
					type: "string",
				},
			],
			description:
				"Change whether the bot will send messages when a user levels up",
			channel: "guild",
			userPermissions: ["ADMINISTRATOR"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		// The third param is the default.
		const currentSetting = this.client.settings.get(
			message.guild!.id,
			"levelUpMessage",
			false
		);

		if (args.value == "enable" && currentSetting !== true) {
			await this.client.settings.set(
				message.guild!.id,
				"levelUpMessage",
				true
			);

			return message.channel.send(
				new MessageEmbed({
					title: ":white_check_mark: Enabled XP Messages",
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
				})
			);
		} else if (args.value == "disable" && currentSetting !== false) {
			await this.client.settings.set(
				message.guild!.id,
				"levelUpMessage",
				false
			);

			return message.channel.send(
				new MessageEmbed({
					title: ":white_check_mark: Disabled XP Messages",
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
				})
			);
		} else {
			return message.channel.send(
				new MessageEmbed({
					title: "Actions",
					color: message.guild?.me?.displayHexColor,
					description:
						"**Level Up Messages:** `" + currentSetting + "`",
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
					fields: [
						{
							name: "`enable`",
							value: "Enable level up messages",
						},
						{
							name: "`disable`",
							value: "Disable level up messages",
						},
					],
				})
			);
		}
	}
}
