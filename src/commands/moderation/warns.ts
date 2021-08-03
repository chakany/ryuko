import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";
import { FieldsEmbed } from "discord-paginationembed";
import moment from "moment";

export default class WarnsCommand extends Command {
	constructor() {
		super("warns", {
			aliases: ["warns", "showwarns"],
			description: "Show a Member's warns",
			category: "Moderation",
			userPermissions: ["MANAGE_MESSAGES"],
			modOnly: true,
			args: [
				{
					id: "member",
					type: "member",
					default: (message: Message) => message.member!,
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const warns: any[] = await this.client.db.getAllWarns(
			args.member.id,
			message.guild!.id
		);

		if (!warns.length)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Member",
					"That Member has no warns!"
				)
			);

		const warnsEmbed = new FieldsEmbed()
			.setArray(warns)
			.setChannel(<TextChannel>message.channel)
			.setAuthorizedUsers([message.author.id])
			.setElementsPerPage(6)
			.formatField("Warns", (warn: any) => {
				const created = moment(warn.createdAt);
				return `Warned By <@!${
					warn.adminId
				}>; <t:${created.unix()}:R>; ${
					warn.reason ? `\`${warn.reason}\`` : "No Reason Provided"
				}`;
			})
			.setPage(1)
			.setPageIndicator(true);

		warnsEmbed.embed
			.setColor(message.guild!.me!.displayHexColor)
			.setTitle(`${args.member.user.tag}'s Warns`)
			.setThumbnail(args.member.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp(new Date())
			.setFooter(
				message.author.tag,
				message.author.displayAvatarURL({ dynamic: true })
			);

		await warnsEmbed.build();
	}
}
