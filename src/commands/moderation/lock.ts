import Command from "../../struct/Command";
import { Message, MessageEmbed, TextChannel } from "discord.js";

export default class LockCommand extends Command {
	constructor() {
		super("lock", {
			aliases: ["lock"],
			description: "Lock a channel",
			category: "Moderation",
			userPermissions: ["MANAGE_CHANNELS"],
			clientPermissions: ["MANAGE_CHANNELS"],
			modOnly: true,
			args: [
				{
					id: "channel",
					type: "channel",
					default: (message: Message) => message.channel,
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (this.client.settings.get(message.guild!.id, "modRole", null))
			(<TextChannel>args.channel).createOverwrite(
				this.client.settings.get(message.guild!.id, "modRole", null),
				{ SEND_MESSAGES: true },
				`Channel Lock requested by ${message.author.tag}`
			);

		(<TextChannel>args.channel).createOverwrite(
			message.guild!.roles.everyone,
			{ SEND_MESSAGES: false },
			`Channel Lock requested by ${message.author.tag}`
		);

		const signalMessage = await message.channel.send(
			new MessageEmbed({
				title: "Locked",
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
						name: "Channel",
						value: args.channel,
						inline: true,
					},
					{
						name: "Locked by",
						value: message.member!,
						inline: true,
					},
				],
			})
		);

		setTimeout(() => signalMessage.delete(), 5000);

		if (this.client.settings.get(message.guild!.id, "logging", false))
			(<TextChannel>(
				message.guild!.channels.cache.get(
					this.client.settings.get(
						message.guild!.id,
						"loggingChannel",
						null
					)
				)
			))?.send(
				new MessageEmbed({
					title: "Channel Locked",
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					thumbnail: {
						url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
					fields: [
						{
							name: "Channel",
							value: args.channel,
							inline: true,
						},
						{
							name: "Locked by",
							value: message.member!,
							inline: true,
						},
					],
				})
			);
	}
}
