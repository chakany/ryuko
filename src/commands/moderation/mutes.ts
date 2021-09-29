import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";
import { MessagePagination } from "@ryukobot/paginationembed";
import moment from "moment";

export default class MutesCommand extends Command {
	constructor() {
		super("mutes", {
			aliases: ["mutes", "showmutes"],
			description: "Show a Member's mutes",
			category: "Moderation",
			userPermissions: ["MANAGE_ROLES"],
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
		const mutes: never[] = await this.client.db.getAllMutes(
			args.member.id,
			message.guild!.id,
		);

		if (!mutes.length)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Member",
						"That Member has no mutes!",
					),
				],
			});

		const mutesEmbed = new MessagePagination({
			message,
			embed: this.embed(
				{
					title: `${args.member.user.tag}'s Mutes`,
					thumbnail: {
						url: args.member.user.displayAvatarURL({
							dynamic: true,
						}),
					},
				},
				message,
			),
			array: mutes,
			itemsPerPage: 6,
			title: "Mutes",
			callbackfn: (mute: any) => {
				const created = moment(mute.createdAt);
				const expires = moment(mute.expires);
				const diff = expires.diff(created);

				const duration = moment.duration(diff);

				return `Muted By <@!${
					mute.adminId
				}>; **${duration.humanize()}**; <t:${created.unix()}:f>; ${
					mute.reason ? `\`${mute.reason}\`` : "No Reason Provided"
				}${mute.unpunished ? `; **Unmuted**` : ""}`;
			},
		});

		mutesEmbed.build();
	}
}
