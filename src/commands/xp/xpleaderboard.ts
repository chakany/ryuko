import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";
import { FieldsEmbed } from "discord-paginationembed";

export default class XpLeaderboardCommand extends Command {
	constructor() {
		super("xpleaderboard", {
			aliases: ["xpleaderboard"],
			description: "Gets the Xp Leaderboard",
			category: "Xp",
		});
	}

	async exec(message: Message) {
		const levels = await this.client.db.getGuildXp(message.guild!.id);

		const levelEmbed = new FieldsEmbed()
			.setArray(levels)
			.setChannel(<TextChannel>message.channel)
			.setAuthorizedUsers([message.author.id])
			.setElementsPerPage(6)
			.formatField(
				"Leaderboard",
				(user: any) =>
					`<@${user.memberId}> \`${user.xp}\` XP; Level \`${user.level}\``
			)
			.setPage(1)
			.setPageIndicator(true)
			.setDisabledNavigationEmojis(["delete"]);

		levelEmbed.embed
			.setColor(message.guild!.me!.displayHexColor)
			.setTitle(`${message.guild!.name} XP Leaderboard`)
			.setThumbnail(message.guild!.iconURL({ dynamic: true }) || "")
			.setTimestamp(new Date())
			.setFooter(
				message.author.tag,
				message.author.displayAvatarURL({ dynamic: true })
			);

		await levelEmbed.build();
	}
}
