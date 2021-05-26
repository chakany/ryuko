import { Command } from "discord-akairo";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";

const canvacord = require("canvacord");

export default class XpCommand extends Command {
	constructor() {
		super("xp", {
			aliases: ["xp"],
			description: "Gets your xp information",
			category: "Info",
		});
	}

	async exec(message: Message) {
		const user = await this.client.db.getMemberXp(
			message.author.id,
			message.guild!.id
		);

		const rank = new canvacord.Rank()
			.renderEmojis(true)
			.setAvatar(
				message.author.displayAvatarURL({
					dynamic: false,
					format: "png",
				})
			)
			.setCurrentXP(user.xp - (user.level - 1) * 500)
			.setRequiredXP(500)
			.setStatus(message.author.presence.status)
			.setProgressBar("#FFFFFF", "COLOR")
			.setUsername(
				message.author.username,
				message.member?.displayHexColor
			)
			.setRank(1, "RANK", false)
			.setLevel(user.level, "LEVEL")
			.setDiscriminator(message.author.discriminator);

		const image = await rank.build();

		const attachment = new MessageAttachment(image, "RankCard.png");
		message.channel.send(attachment);
	}
}
