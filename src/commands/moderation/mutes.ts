import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";
import { FieldsEmbed } from "discord-paginationembed";
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
		const mutes: any[] = await this.client.db.getAllMutes(
			args.member.id,
			message.guild!.id
		);

		if (!mutes.length)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Member",
					"That Member has no mutes!"
				)
			);

		const mutesEmbed = new FieldsEmbed()
			.setArray(mutes)
			.setChannel(<TextChannel>message.channel)
			.setAuthorizedUsers([message.author.id])
			.setElementsPerPage(6)
			.formatField("Mutes", (mute: any) => {
				const created = moment(mute.createdAt);
				const expires = moment(mute.expires);
				const diff = expires.diff(created);

				const duration = moment.duration(diff);

				return `Muted By <@!${
					mute.adminId
				}>; **${duration.humanize()}**; <t:${created.unix()}:f>; ${
					mute.reason ? `\`${mute.reason}\`` : "No Reason Provided"
				}${mute.unpunished ? `; **Unmuted**` : ""}`;
			})
			.setPage(1)
			.setPageIndicator(true);

		mutesEmbed.embed
			.setColor(message.guild!.me!.displayHexColor)
			.setTitle(`${args.member.user.tag}'s Mutes`)
			.setThumbnail(args.member.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp(new Date())
			.setFooter(
				message.author.tag,
				message.author.displayAvatarURL({ dynamic: true })
			);

		await mutesEmbed.build();
	}
}
