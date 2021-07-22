import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

import axios from "axios";

export default class CovidCommand extends Command {
	constructor() {
		super("covid", {
			aliases: ["covid"],
			description: "Shows covid stats",
			category: "Search",

			args: [
				{
					id: "country",
					type: "string",
				},
			],
		});
	}

	async exec(message: Message): Promise<any> {
		const baseUrl = "https://corona.lmao.ninja/v2";

		let url, response, corona;

		try {
			url = message.util!.parsed?.content
				? `${baseUrl}/countries/${message.util!.parsed?.content}`
				: `${baseUrl}/all`;
			response = await axios.get(url);
			corona = response.data;
		} catch (error) {
			return message.channel.send(
				`***${
					message.util!.parsed?.content
				}*** doesn't exist, or data isn't being collected`
			);
		}
		await message.channel.send(
			new MessageEmbed({
				title: message.util!.parsed?.content
					? `${message.util!.parsed?.content.toUpperCase()} Stats`
					: "Total Corona Cases World Wide",
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
						name: "Total Cases:",
						value: corona.cases.toLocaleString(),
						inline: true,
					},
					{
						name: "Total Deaths:",
						value: corona.deaths.toLocaleString(),
						inline: true,
					},
					{
						name: "Total Recovered:",
						value: corona.recovered.toLocaleString(),
						inline: true,
					},
					{
						name: "Active Cases:",
						value: corona.active.toLocaleString(),
						inline: true,
					},
					{
						name: "\u200b",
						value: "\u200b",
						inline: true,
					},
					{
						name: "Critical Cases:",
						value: corona.critical.toLocaleString(),
						inline: true,
					},
					{
						name: "Today Recoveries:",
						value: corona.todayRecovered
							.toLocaleString()
							.replace("-", ""),
						inline: true,
					},
					{
						name: "Todays Deaths:",
						value: corona.todayDeaths.toLocaleString(),
						inline: true,
					},
				],
			})
		);
	}
}
