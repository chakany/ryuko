import { Command } from "discord-akairo";
import { Message, MessageEmbed, GuildMember } from "discord.js";

export default class MemberinfoCommand extends Command {
	constructor() {
		super("memberinfo", {
			aliases: ["memberinfo", "minfo"],
			description: "Get information about a member",
			category: "Info",
			args: [
				{
					id: "member",
					type: "member",
				},
			],
		});
	}

	async exec(message: Message, args: any) {
		const member: GuildMember = args.member ? args.member : message.member;

		return message.channel.send(
			new MessageEmbed({
				title: `${member.user.tag}'s Info`,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				thumbnail: {
					url: member.user.displayAvatarURL({ dynamic: true }),
				},
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
				fields: [
					{
						name: "Tag",
						value: `\`${member.user.tag}\``,
						inline: true,
					},
					{
						name: "Username",
						value: `\`${member.user.username}\``,
						inline: true,
					},
					{
						name: "Discriminator",
						value: `\`${member.user.discriminator}\``,
						inline: true,
					},
					{
						name: "Nickname",
						value: member.nickname
							? `\`${member.nickname}\``
							: "None",
						inline: true,
					},
					{
						name: "Bot",
						value: member.user.bot ? "Yes" : "No",
						inline: true,
					},
					{
						name: "Created At",
						value: `<t:${Math.round(
							member.user.createdAt.getTime() / 1000
						)}:f>`,
						inline: true,
					},
					{
						name: "Joined At",
						value: `<t:${Math.round(
							member.joinedAt!.getTime() / 1000
						)}:f>`,
						inline: true,
					},
					{
						name: "Role Color",
						value: `\`${member.displayHexColor}\``,
						inline: true,
					},
					{
						name: "Role Count",
						value: member.roles.cache.size,
						inline: true,
					},
					{
						name: "Boosting Since",
						value: member.premiumSinceTimestamp
							? `<t:${Math.round(
									member.premiumSince!.getTime() / 1000
							  )}:f>`
							: "Not currently boosting server",
						inline: true,
					},
				],
				/* TODO: Add user banner
				image: {
					url: member.user.banner,
				},*/
			})
		);
	}
}
