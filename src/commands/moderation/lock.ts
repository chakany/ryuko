import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";

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
			(<TextChannel>args.channel).permissionOverwrites.create(
				this.client.settings.get(message.guild!.id, "modRole", null),
				{ SEND_MESSAGES: true },
				{ reason: `Channel Lock requested by ${message.author.tag}` },
			);

		(<TextChannel>args.channel).permissionOverwrites.create(
			message.guild!.roles.everyone,
			{ SEND_MESSAGES: false },
			{ reason: `Channel Lock requested by ${message.author.tag}` },
		);

		const signalMessage = await message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Locked",
						fields: [
							{
								name: "Channel",
								value: args.channel.toString(),
								inline: true,
							},
							{
								name: "Locked by",
								value: message.member!.toString(),
								inline: true,
							},
						],
					},
					message,
				),
			],
		});

		setTimeout(
			() => Promise.all([signalMessage.delete(), message.delete()]),
			5000,
		);

		this.client.sendToLogChannel(message.guild!, "guild", {
			embeds: [
				this.embed(
					{
						title: "Channel Locked",
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
								name: "Locked by",
								value: message.member!.toString(),
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
