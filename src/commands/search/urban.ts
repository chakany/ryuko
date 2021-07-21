import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import ud from "urban-dictionary";

export default class UrbanCommand extends Command {
	constructor() {
		super("urban", {
			aliases: ["urban", "urbandictionary", "ud"],
			description: "Search for definition(s) on the Urban Dictionary!",
			category: "Search",
			args: [
				{
					id: "word",
					type: "string",
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		// Return the word(s) of the day if there is no search term
		const embed = new MessageEmbed({
			title: "Words of the day",
			color: message.guild?.me?.displayHexColor,
			timestamp: new Date(),
			footer: {
				text: message.author.tag,
				icon_url: message.author.displayAvatarURL({
					dynamic: true,
				}),
			},
			author: {
				iconURL:
					"https://scontent.fewr1-5.fna.fbcdn.net/v/t1.6435-9/67117447_10156819767173172_7554494861143965696_n.png?_nc_cat=107&ccb=1-3&_nc_sid=973b4a&_nc_ohc=u7a7_XvWIvsAX9kFaE0&_nc_ht=scontent.fewr1-5.fna&oh=06b335da98c2b2fc1175727fdd991e7e&oe=60CBA20E",
				name: "Urban Dictionary",
				url: "https://www.urbandictionary.com",
			},
		});
		if (!args.word) {
			try {
				const definitions = await ud.wordsOfTheDay();
				for await (let definition of definitions) {
					let field = `***Definition:*** ${definition.definition}\n***Example:*** ${definition.example}\n[See Page](${definition.permalink})`;
					field =
						field.length >= 2000
							? field.slice(0, 2000) + "..."
							: field;

					embed.addField(definition.word, field);
				}

				return message.channel.send(embed);
			} catch (error) {
				this.client.log.error(error);
				return message.channel.send(
					this.client.error(
						message,
						this,
						"An error occurred",
						error.message
					)
				);
			}
		}
		try {
			const definitions = await ud.define(message.util?.parsed?.content!);
			embed.setTitle("Search: `" + message.util?.parsed?.content! + "`");
			for await (let definition of definitions) {
				let field = `***Definition:*** ${definition.definition}\n***Example:*** ${definition.example}\n[See Page](${definition.permalink})`;
				field =
					field.length >= 2000 ? field.slice(0, 2000) + "..." : field;

				embed.addField(definition.word, field);
			}

			return message.channel.send(embed);
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				this.client.error(
					message,
					this,
					"An error occurred",
					error.message
				)
			);
		}
	}
}
