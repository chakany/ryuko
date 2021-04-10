import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import axios from "axios";

import Error from "../../utils/error";

const arg = [
	{
		id: "country",
		type: "string",
	},
];

export default class CovidCommand extends Command {
	protected args = arg;

	constructor() {
		super("covid", {
			aliases: ["covid"],
			description: "Shows covid stats",
			category: "Fun",
			channel: "guild",
			args: arg,
		});
	}

	async exec(message: Message): Promise<any> {
		try {
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

			const embed = new MessageEmbed()
				.setTitle(
					message.util!.parsed?.content
						? `${message.util!.parsed?.content.toUpperCase()} Stats`
						: "Total Corona Cases World Wide"
				)
				.setColor("#D50000")
				.addFields(
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
						value: corona.todayRecovered.toLocaleString().replace("-", ""),
						inline: true,
					},
					{
						name: "Todays Deaths:",
						value: corona.todayDeaths.toLocaleString(),
						inline: true,
					}
				);

			await message.channel.send(embed);
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
}
