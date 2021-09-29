import Command from "../../struct/Command";
import { Message, MessageEmbed, TextChannel } from "discord.js";

export default class RemoveMemberCommand extends Command {
	constructor() {
		super("removemember", {
			aliases: ["removemember"],
			description: "Removes a member from the current ticket",
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
						"You must provide a member to remove!",
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
			(<TextChannel>message.channel).permissionOverwrites.delete(
				args.member.id,
			);

			return message.channel.send({
				embeds: [
					this.embed(
						{
							title: `${this.client.emoji.greenCheck} Removed member`,
							fields: [
								{
									name: "Member",
									value: args.member,
									inline: true,
								},
								{
									name: "Removed by",
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
