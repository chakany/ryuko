import { Command, Argument } from "discord-akairo";
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
				return message.channel.send(
					new MessageEmbed({
						title: "Ticketing Actions",
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						footer: {
							text: message.author.tag,
							icon_url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
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
								name: "`role <value>`",
								value: "Role to automatically give access to tickets",
							},
							{
								name: "`category <value>`",
								value: "Category to make new tickets under (must be an ID)",
							},
						],
					})
				);
				break;
			case "enable":
				this.client.settings.set(message.guild!.id, "tickets", true);

				return message.channel.send(
					new MessageEmbed({
						title: `${this.client.config.emojis.greenCheck} Enabled Tickets`,
						description: "Tickets have been enabled",
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						footer: {
							text: message.author.tag,
							icon_url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
					})
				);
				break;
			case "disable":
				this.client.settings.set(message.guild!.id, "tickets", false);

				return message.channel.send(
					new MessageEmbed({
						title: `${this.client.config.emojis.greenCheck} Disabled Tickets`,
						description: "Tickets have been disabled",
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						footer: {
							text: message.author.tag,
							icon_url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
					})
				);
				break;
			case "role":
				const oldRole = this.client.settings.get(
					message.guild!.id,
					"ticketRole",
					null
				);

				if (!args.value)
					return message.channel.send(
						new MessageEmbed({
							title: "Current Ticket Role",
							description: oldRole
								? `The current role for tickets is <#${oldRole}>`
								: "There is no current role for tickets",
							color: message.guild?.me?.displayHexColor,
							timestamp: new Date(),
							footer: {
								text: message.author.tag,
								icon_url: message.author.displayAvatarURL({
									dynamic: true,
								}),
							},
						})
					);
				this.client.settings.set(
					message.guild!.id,
					"ticketRole",
					args.value.id
				);

				return message.channel.send(
					new MessageEmbed({
						title: `${this.client.config.emojis.greenCheck} Changed Ticket Role`,
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						footer: {
							text: message.author.tag,
							icon_url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
						fields: [
							{
								name: "Before",
								value: oldRole ? `<@&${oldRole}>` : "None",
								inline: true,
							},
							{
								name: "After",
								value: args.value,
								inline: true,
							},
						],
					})
				);
				break;
			case "category":
				const oldCategory = this.client.settings.get(
					message.guild!.id,
					"ticketCategory",
					null
				);

				if (!args.value)
					return message.channel.send(
						new MessageEmbed({
							title: "Current Ticket Category",
							description: oldCategory
								? `The current category for tickets is \`${oldCategory}\``
								: "There is no current category for tickets",
							color: message.guild?.me?.displayHexColor,
							timestamp: new Date(),
							footer: {
								text: message.author.tag,
								icon_url: message.author.displayAvatarURL({
									dynamic: true,
								}),
							},
						})
					);
				this.client.settings.set(
					message.guild!.id,
					"ticketCategory",
					args.value
				);

				return message.channel.send(
					new MessageEmbed({
						title: `${this.client.config.emojis.greenCheck} Changed Ticket Category`,
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						footer: {
							text: message.author.tag,
							icon_url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
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
					})
				);
		}
	}
}
