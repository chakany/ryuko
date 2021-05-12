import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

const google = require("google-it");

export default class GoogleCommand extends Command {
	constructor() {
		super("google", {
			aliases: ["google", "googlesearch", "search"],
			description: "Search Google",
			category: "Search",
		});
	}

	async exec(message: Message): Promise<any> {
    if (!message.util?.parsed?.content)
      return message.channel.send(this.client.error(message, this, "Invalid Arguments", "You must provide a search query!"));

    let results;
    try {
      results = await google({ query: message.util?.parsed?.content });
    } catch (error) {
      this.client.log.error(error);
      return message.channel.send(this.client.error(message, this, "An Error Occurred", "Please try again, if the issue keeps occurring, please contact jacany#0001."));
    }

    let embed = new MessageEmbed({
			title: message.util!.parsed!.content,
      url: `https://www.google.com/search?q=${message.util!.parsed!.content}`,
			color: message.guild?.me?.displayHexColor,
			timestamp: new Date(),
			footer: {
				text: message.author.tag,
				icon_url: message.author.displayAvatarURL({ dynamic: true }),
			},
		});

    for await (let result of results) {
      embed.addField(result.title, (result.snippet.length() > 70 ? result.snippet.substring(0, 70) : result.snippet) + `\n${result.link}`);
    }

    return message.channel.send(embed);
	}
}
