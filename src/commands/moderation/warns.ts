import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";
import PaginationEmbed from "../../utils/PaginationEmbed";
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
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Member",
						"That Member has no warns!"
					),
				],
			});

		const warnsEmbed = new PaginationEmbed(message)
			.format((warn: any) => {
				const created = moment(warn.createdAt);
				return `Warned By <@!${
					warn.adminId
				}>; <t:${created.unix()}:R>; ${
					warn.reason ? `\`${warn.reason}\`` : "No Reason Provided"
				}`;
			})
			.setFieldName("Warns")
			.setExpireTime(60000);

		warnsEmbed.setEmbed({
			title: `${args.member.user.tag}'s Warnings`,
			thumbnail: {
				url: args.member.user.displayAvatarURL({ dynamic: true }),
			},
		});

		await warnsEmbed.send(warns, 6);
	}
}
