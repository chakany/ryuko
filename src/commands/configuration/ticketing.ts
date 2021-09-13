import { Argument } from "@ryukobot/discord-akairo";
import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class TicketingCommand extends Command {
	constructor() {
		super("ticketing", {
			aliases: ["ticketing"],
			category: "Configuration",
			args: [
				{
					id: "action",
					type: "string",
				},
				{
					id: "value",
					type: Argument.union("role", "string"),
				},
			],
			description: "Configure tickets",

			userPermissions: ["MANAGE_GUILD"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		switch (args.action) {
			default:
				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: "Ticketing Subcommands",
								description: `See more information on the [Ticketing Wiki](${this.client.config.siteUrl}/wiki/Features/Ticketing)`,
								fields: [
									{
										name: "`enable`",
										value: "Enable tickets",
									},
									{
										name: "`disable`",
										value: "Disable tickets",
									},
									{
										name: "`role <role>`",
										value: "Role to automatically give access to tickets",
									},
									{
										name: "`category <value>`",
										value: "Category to make new tickets under (must be an ID)",
									},
								],
							},
							message
						),
					],
				});
				break;
			case "enable":
				this.client.settings.set(message.guild!.id, "tickets", true);

				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Enabled Tickets`,
								description: "Tickets have been enabled",
							},
							message
						),
					],
				});
				break;
			case "disable":
				this.client.settings.set(message.guild!.id, "tickets", false);

				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Disabled Tickets`,
								description: "Tickets have been disabled",
							},
							message
						),
					],
				});
				break;
			case "role":
				const oldRole = this.client.settings.get(
					message.guild!.id,
					"ticketRole",
					null
				);

				if (!args.value)
					return message.channel.send({
						embeds: [
							this.embed(
								{
									title: "Current Ticket Role",
									description: oldRole
										? `The current role for tickets is <#${oldRole}>`
										: "There is no current role for tickets",
								},
								message
							),
						],
					});
				this.client.settings.set(
					message.guild!.id,
					"ticketRole",
					args.value.id
				);

				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Changed Ticket Role`,
								fields: [
									{
										name: "Before",
										value: oldRole
											? `<@&${oldRole}>`
											: "None",
										inline: true,
									},
									{
										name: "After",
										value: args.value.toString(),
										inline: true,
									},
								],
							},
							message
						),
					],
				});
				break;
			case "category":
				const oldCategory = this.client.settings.get(
					message.guild!.id,
					"ticketCategory",
					null
				);

				if (!args.value)
					return message.channel.send({
						embeds: [
							this.embed(
								{
									title: "Current Ticket Category",
									description: oldCategory
										? `The current category for tickets is \`${oldCategory}\``
										: "There is no current category for tickets",
								},
								message
							),
						],
					});
				this.client.settings.set(
					message.guild!.id,
					"ticketCategory",
					args.value
				);

				return message.channel.send({
					embeds: [
						this.embed(
							{
								title: `${this.client.emoji.greenCheck} Changed Ticket Category`,
								fields: [
									{
										name: "Before",
										value: oldCategory
											? `\`${oldCategory}\``
											: "None",
										inline: true,
									},
									{
										name: "After",
										value: `\`${args.value}\``,
										inline: true,
									},
								],
							},
							message
						),
					],
				});
		}
	}
}
