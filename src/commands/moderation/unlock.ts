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
			(<TextChannel>args.channel).permissionOverwrites.delete(
				`Channel Unlock Requested by ${message.author.tag}`
			);

		(<TextChannel>args.channel).permissionOverwrites.delete(
			`Channel Unlock Requested by ${message.author.tag}`
		);

		const signalMessage = await message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Unlocked",
						fields: [
							{
								name: "Channel",
								value: args.channel.toString(),
								inline: true,
							},
							{
								name: "Unlocked by",
								value: message.member!.toString(),
								inline: true,
							},
						],
					},
					message
				),
			],
		});

		setTimeout(() => signalMessage.delete(), 5000);

		this.client.sendToLogChannel(
			{
				embeds: [
					this.embed(
						{
							title: "Channel Unlocked",
							thumbnail: {
								url: message.author.displayAvatarURL({
									dynamic: true,
								}),
							},
							footer: {},
							fields: [
								{
									name: "Channel",
									value: args.channel.toString(),
									inline: true,
								},
								{
									name: "Unlocked by",
									value: message.member!.toString(),
									inline: true,
								},
							],
						},
						message
					),
				],
			},
			message.guild!
		);
	}
}
