import Command from "../../struct/Command";
import { Message, MessageEmbed, TextChannel } from "discord.js";

export default class UnlockCommand extends Command {
	constructor() {
		super("unlock", {
			aliases: ["unlock"],
			description: "Unlock a channel",
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
			(<TextChannel>args.channel).permissionOverwrites
				.get(
					this.client.settings.get(message.guild!.id, "modRole", null)
				)
				?.delete(`Channel Unlock Requested by ${message.author.tag}`);

		(<TextChannel>args.channel).permissionOverwrites
			.get(message.guild!.roles.everyone.id)
			?.delete(`Channel Unlock Requested by ${message.author.tag}`);

		const signalMessage = await message.channel.send(
			new MessageEmbed({
				title: "Unlocked",
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
						name: "Unlocked by",
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
					title: "Channel Unlocked",
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
							name: "Unlocked by",
							value: message.member!,
							inline: true,
						},
					],
				})
			);
	}
}
