import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class ServerinfoCommand extends Command {
	constructor() {
		super("serverinfo", {
			aliases: ["serverinfo", "sinfo"],
			description: "Get information about the server",
			category: "Info",
		});
	}

	async exec(message: Message) {
		return message.channel.send(
			new MessageEmbed({
				title: `${message.guild!.name} Info`,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				thumbnail: {
					url: message.guild!.iconURL({ dynamic: true })!,
				},
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
				fields: [
					{
						name: "Members",
						value: message.guild!.memberCount,
						inline: true,
					},
					{
						name: "Shard",
						value: message.guild!.shardID,
						inline: true,
					},
					{
						name: "Owner",
						value: message.guild!.owner,
						inline: true,
					},
					{
						name: "Created At",
						value: `<t:${Math.round(
							message.guild!.createdAt.getTime() / 1000
						)}:f>`,
						inline: true,
					},
					{
						name: "Role Count",
						value: message.guild!.roles.cache.size,
						inline: true,
					},
					{
						name: "Emoji Count",
						value: message.guild!.emojis.cache.size,
						inline: true,
					},
					{
						name: "Channel Count",
						value: message.guild!.channels.cache.size,
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
						value: message.guild!.premiumSubscriptionCount,
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
			})
		);
	}
}
