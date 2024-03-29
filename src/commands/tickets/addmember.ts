import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";

export default class AddMemberCommand extends Command {
	constructor() {
		super("addmember", {
			aliases: ["addmember"],
			description: "Adds a member to the current ticket",
			category: "Tickets",
			clientPermissions: ["MANAGE_CHANNELS"],
			args: [
				{
					id: "member",
					type: "member",
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.member)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You must provide a member to add!",
					),
				],
			});

		const ticketResult = await this.client.db.findTicket(
			message.guild!.id,
			message.channel.id,
		);

		if (!ticketResult)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Channel",
						"This is not a ticket channel!",
					),
				],
			});

		const ticketRole = this.client.settings.get(
			message.guild!.id,
			"ticketRole",
			null,
		);

		if (
			(ticketRole &&
				message.member!.roles.cache.find(
					(role) => role.id == ticketRole,
				)) ||
			message.member!.permissions.has("MANAGE_CHANNELS")
		) {
			// for some reason updateOverwrite didn't exist unless i casted...
			(<TextChannel>message.channel).permissionOverwrites.create(
				args.member.id,
				{
					VIEW_CHANNEL: true,
					SEND_MESSAGES: true,
				},
			);

			return message.channel.send({
				embeds: [
					this.embed(
						{
							title: `${this.client.emoji.greenCheck} Added member`,
							fields: [
								{
									name: "Member",
									value: args.member,
									inline: true,
								},
								{
									name: "Added by",
									value: message.member,
									inline: true,
								},
							],
						},
						message,
					),
				],
			});
		} else
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Permissions",
						`Only Channel Managers${
							ticketRole
								? `, and members with the <@&${ticketRole}> role`
								: ""
						} can run this command!`,
					),
				],
			});
	}
}
