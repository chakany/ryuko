import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";

export default class PanelCommand extends Command {
	constructor() {
		super("panel", {
			aliases: ["panel", "pterodactyl"],
			description: "Execute functions on the Pterodactyl panel.",
			category: "Owner",
			args: [
				{
					id: "action",
					type: "string",
				},
				{
					id: "server",
					type: "string",
				},
			],
			ownerOnly: true,
		});
	}

	async _getServers(): Promise<AxiosResponse> {
		return await axios.get(
			this.client.config.pterodactyl.url + "/api/client/",
			{
				headers: {
					Authorization: `Bearer ${this.client.config.pterodactyl.key}`,
					"Content-Type": "application/json",
					Accept: "Application/vnd.pterodactyl.v1+json",
				},
			}
		);
	}

	async _getResources(server: string): Promise<AxiosResponse> {
		return await axios.get(
			this.client.config.pterodactyl.url +
				`/api/client/servers/${server}/resources`,
			{
				headers: {
					Authorization: `Bearer ${this.client.config.pterodactyl.key}`,
					"Content-Type": "application/json",
					Accept: "Application/vnd.pterodactyl.v1+json",
				},
			}
		);
	}

	async _setPower(server: string, state: string): Promise<AxiosResponse> {
		return axios.post(
			this.client.config.pterodactyl.url +
				`/api/client/servers/${server}/power`,
			{
				signal: state,
			},
			{
				headers: {
					Authorization: `Bearer ${this.client.config.pterodactyl.key}`,
					"Content-Type": "application/json",
					Accept: "Application/vnd.pterodactyl.v1+json",
				},
			}
		);
	}

	async exec(message: Message, args: any): Promise<any> {
		if (
			!this.client.config.pterodactyl.key ||
			!this.client.config.pterodactyl.url
		)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Configuration",
					"You must set a Pterodactyl API Url and Key in your config!"
				)
			);
		switch (args.action) {
			case "list":
				const listMessage = await message.channel.send(
					new MessageEmbed({
						title:
							this.client.config.emojis.loading +
							" *Please wait..*",
						description: "Requesting information from panel.",
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
				const embed = new MessageEmbed({
					title: "All Servers",
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
				});

				try {
					await Promise.all(
						(
							await this._getServers()
						).data.data.map(async (server: any) => {
							const info = server.attributes;
							let field =
								"UUID: `" +
								info.uuid +
								"`\nIndentifier: `" +
								info.identifier +
								"`";
							const resources = await (
								await this._getResources(info.identifier)
							).data.attributes;
							if (info.description)
								field =
									field +
									"\nDescription:`" +
									info.description +
									"`";
							if (resources.resources.cpu_absolute != 0)
								field =
									field +
									"\nCPU: `" +
									resources.resources.cpu_absolute +
									"`/`" +
									info.limits.cpu +
									"`";
							if (resources.resources.memory_bytes != 0)
								field =
									field +
									"\nMemory: `" +
									(
										resources.resources.memory_bytes /
										(1024 * 1024)
									).toFixed(4) +
									"`/`" +
									info.limits.memory +
									"`MB";
							field =
								field +
								"\nDisk: `" +
								(
									resources.resources.disk_bytes /
									(1024 * 1024)
								).toFixed(4) +
								"`/`" +
								info.limits.disk +
								"`MB";

							switch (resources.current_state) {
								case "running":
									embed.addField(
										`${this.client.config.emojis.online} ${info.name}`,
										field,
										true
									);
									break;
								case "starting":
									embed.addField(
										`${this.client.config.emojis.idle} ${info.name}`,
										field,
										true
									);
									break;
								case "stopping":
									embed.addField(
										`${this.client.config.emojis.idle} ${info.name}`,
										field,
										true
									);
									break;
								case "offline":
									embed.addField(
										`${this.client.config.emojis.dnd} ${info.name}`,
										field,
										true
									);
									break;
								default:
									embed.addField(
										`${this.client.config.emojis.invisible} ${info.name}`,
										field,
										true
									);
							}
						})
					);
					listMessage.edit(embed);
				} catch (error) {
					this.client.log.error(error);
					message.channel.send(
						this.client.error(
							message,
							this,
							"An error occurred",
							error.message
						)
					);
					return false;
				}
				break;
			case "start":
				if (!args.server)
					return message.channel.send(
						this.client.error(
							message,
							this,
							"Invalid Arguments",
							"You must provide a server!"
						)
					);
				this._powerAction(
					message,
					args.server,
					args.action.toLowerCase()
				);
				break;
			case "restart":
				if (!args.server)
					return message.channel.send(
						this.client.error(
							message,
							this,
							"Invalid Arguments",
							"You must provide a server!"
						)
					);
				this._powerAction(
					message,
					args.server,
					args.action.toLowerCase()
				);
				break;
			case "stop":
				if (!args.server)
					return message.channel.send(
						this.client.error(
							message,
							this,
							"Invalid Arguments",
							"You must provide a server!"
						)
					);
				this._powerAction(
					message,
					args.server,
					args.action.toLowerCase()
				);
				break;
			case "kill":
				if (!args.server)
					return message.channel.send(
						this.client.error(
							message,
							this,
							"Invalid Arguments",
							"You must provide a server!"
						)
					);
				this._powerAction(
					message,
					args.server,
					args.action.toLowerCase()
				);
				break;
			default:
				return message.channel.send(
					new MessageEmbed({
						title: "Available Panel Actions",
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
								name: "`list`",
								value: "List all servers",
							},
							{
								name: "`start`",
								value: "Start a server",
							},
							{
								name: "`restart`",
								value: "Restart a server",
							},
							{
								name: "`stop`",
								value: "Stop a server",
							},
							{
								name: "`kill`",
								value: "Kill a server",
							},
						],
					})
				);
		}
		return true;
	}

	async _powerAction(
		message: Message,
		server: string,
		state: string
	): Promise<boolean> {
		const startMessage = await message.channel.send(
			new MessageEmbed({
				title: this.client.config.emojis.loading + " *Please wait..*",
				description: "Sending command to panel.",
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
		try {
			await this._setPower(server, state);
			startMessage.edit(
				new MessageEmbed({
					title: `${this.client.config.emojis.greenCheck} Request Sent!`,
					description:
						"Sucessfully sent the request to " +
						state +
						" `" +
						server +
						"`.",
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
		} catch (error) {
			this.client.log.error(error);
			message.channel.send(
				this.client.error(
					message,
					this,
					"An error occurred",
					error.message
				)
			);
			return false;
		}

		return true;
	}
}