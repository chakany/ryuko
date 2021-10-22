import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class ServerinfoCommand extends Command {
	constructor() {
		super("serverinfo", {
			aliases: ["serverinfo", "sinfo"],
			description: "Get information about the server",
			category: "Info",
		});
	}

	async exec(message: Message) {
		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: `${message.guild!.name} Info`,
						thumbnail: {
							url: message.guild!.iconURL({ dynamic: true })!,
						},
						fields: [
							{
								name: "Members",
								value: message.guild!.memberCount.toString(),
								inline: true,
							},
							{
								name: "Shard",
								value: message.guild!.shardId.toString(),
								inline: true,
							},
							{
								name: "Owner",
								value: (
									await message.guild!.fetchOwner()
								).toString(),
								inline: true,
							},
							{
								name: "Created At",
								value: `<t:${Math.round(
									message.guild!.createdAt.getTime() / 1000,
								)}:f>`,
								inline: true,
							},
							{
								name: "Role Count",
								value: message.guild!.roles.cache.size.toString(),
								inline: true,
							},
							{
								name: "Emoji Count",
								value: message.guild!.emojis.cache.size.toString(),
								inline: true,
							},
							{
								name: "Channel Count",
								value: message.guild!.channels.cache.size.toString(),
								inline: true,
							},
							{
								name: "Verified",
								value: message.guild!.verified ? "Yes" : "No",
								inline: true,
							},
							{
								name: "Partnered",
								value: message.guild!.partnered ? "Yes" : "No",
								inline: true,
							},
							{
								name: "Boosts",
								value:
									message.guild!.premiumSubscriptionCount?.toString() ||
									"0",
								inline: true,
							},
							{
								name: "Boost Tier",
								value: message.guild!.premiumTier,
								inline: true,
							},
							{
								name: "Vanity URL",
								value: message.guild!.vanityURLCode
									? `\`${message.guild!.vanityURLCode}\``
									: "None",
								inline: true,
							},
						],
						image: {
							url: message.guild!.bannerURL()!,
						},
					},
					message,
				),
			],
		});
	}
}
