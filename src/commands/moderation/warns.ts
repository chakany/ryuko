import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";
import { MessagePagination } from "@ryukobot/paginationembed";
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
		const warns: never[] = await this.client.db.getAllWarns(
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

		const warnsEmbed = new MessagePagination({
			embed: this.embed(
				{
					title: `${args.member.user.tag}'s Warns`,
					thumbnail: {
						url: args.member.user.displayAvatarURL({
							dynamic: true,
						}),
					},
				},
				message
			),
			message,
			array: warns,
			title: "Warns",
			itemsPerPage: 6,
			callbackfn: (warn: any) => {
				const created = moment(warn.createdAt);
				return `Warned By <@!${
					warn.adminId
				}>; <t:${created.unix()}:R>; ${
					warn.reason ? `\`${warn.reason}\`` : "No Reason Provided"
				}`;
			},
		});

		warnsEmbed.build();
	}
}
