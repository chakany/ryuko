import Command from "../../struct/Command";
import { Message, OverwriteResolvable, TextChannel } from "discord.js";

export default class TicketCommand extends Command {
	constructor() {
		super("newticket", {
			aliases: ["ticket", "newticket"],
			description: "Open a new ticket",
			category: "Tickets",
			clientPermissions: ["MANAGE_CHANNELS", "MANAGE_MESSAGES"],
		});
	}

	async exec(message: Message): Promise<any> {
		if (!this.client.settings.get(message.guild!.id, "tickets", false))
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Configuration",
						`Ticketing is not currently setup, please set it up with the \`${
							message.util?.parsed?.prefix
						}${
							this.handler.findCommand("ticketing").aliases[0]
						}\` command!`,
					),
				],
			});

		const perms: OverwriteResolvable[] = [
			{
				id: message.guild!.roles.everyone,
				deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
			},
			{
				id: message.author.id,
				allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
			},
			{
				id: this.client.user!.id,
				allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
			},
		];

		const roleToAdd = this.client.settings.get(
			message.guild!.id,
			"ticketRole",
			null,
		);

		if (roleToAdd)
			perms.push({
				id: roleToAdd,
				allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
			});

		let channel: TextChannel | undefined;

		// Try catch assuming that we have all of the permissions, and that the error is related to the category.
		try {
			channel = await message.guild?.channels.create(
				`ticket-${message.author.username}`,
				{
					topic: `Opened on <t:${Math.round(
						new Date().getTime() / 1000,
					)}:f> by ${message.member}`,
					reason: `${
						message.author.tag
					} opened a ticket on ${new Date().toString()}`,
					permissionOverwrites: perms,
					parent: this.client.settings.get(
						message.guild!.id,
						"ticketCategory",
						undefined,
					),
				},
			);
		} catch (error) {
			channel = await message.guild?.channels.create(
				`ticket-${message.author.username}`,
				{
					topic: `Opened on <t:${Math.round(
						new Date().getTime() / 1000,
					)}:f> by ${message.member}`,
					reason: `${
						message.author.tag
					} opened a ticket on <t:${Math.round(
						new Date().getTime() / 1000,
					)}:f>`,
					permissionOverwrites: perms,
				},
			);
		}

		await this.client.db.addTicket(
			message.guild!.id,
			message.author.id,
			channel!.id,
		);

		channel!.send({
			embeds: [
				this.embed(
					{
						title: "Ticket Opened",
						description: `**The following commands can be used to manage this ticket:**\n\`${
							message.util?.parsed?.prefix
						}${
							this.handler.findCommand("closeticket").aliases[0]
						}\` ${
							this.handler.findCommand("closeticket").description
						}\n\`${message.util?.parsed?.prefix}${
							this.handler.findCommand("addmember").aliases[0]
						}\` ${
							this.handler.findCommand("addmember").description
						}\n\`${message.util?.parsed?.prefix}${
							this.handler.findCommand("removemember").aliases[0]
						}\` ${
							this.handler.findCommand("removemember").description
						}`,
					},
					message,
				),
			],
		});

		message.delete();
	}
}
