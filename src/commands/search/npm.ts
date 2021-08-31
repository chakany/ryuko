import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";

export default class NpmCommand extends Command {
	constructor() {
		super("npm", {
			aliases: ["npm"],
			description: "Search NPM for a package",
			category: "Search",
			args: [
				{
					id: "package",
					type: "string",
				},
			],
		});
	}

	async _getPackage(query: string): Promise<AxiosResponse> {
		return axios.get(`https://api.npms.io/v2/package/${query}`);
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.package)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Arguments",
					"You must provide a package!"
				)
			);
		try {
			const request = await this._getPackage(
				message.util?.parsed?.content!
			);
			const data = request.data;
			const embed = new MessageEmbed({
				title: data.collected.metadata.name,
				description: data.collected.metadata.description
					? data.collected.metadata.description
					: "",
				url: data.collected.metadata.links.npm,
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
				author: {
					name: data.collected.metadata.publisher.username,
					url: `https://www.npmjs.com/~${data.collected.metadata.publisher.username}`,
				},
				fields: [
					{
						name: "Version",
						value: data.collected.metadata.version,
						inline: true,
					},
					{
						name: "License",
						value: data.collected.metadata.license
							? `[${data.collected.metadata.license}](https://opensource.org/licenses/${data.collected.metadata.license})`
							: "None",
						inline: true,
					},
					{
						name: "Dependency Count",
						value: Object.keys(
							data.collected.metadata.dependencies
								? data.collected.metadata.dependencies
								: {}
						).length,
						inline: true,
					},
					{
						name: "Dev Dependency Count",
						value: Object.keys(
							data.collected.metadata.devDependencies
								? data.collected.metadata.devDependencies
								: {}
						).length,
						inline: true,
					},
				],
			});
			return message.channel.send(embed);
		} catch (error: any) {
			if (error.message == "Request failed with status code 404")
				return message.channel.send(
					this.client.error(
						message,
						this,
						"Invalid Arguments",
						"I could not find that package!"
					)
				);
			throw error;
		}
	}
}
