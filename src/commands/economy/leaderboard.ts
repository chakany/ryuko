import Command from "../../struct/Command";
import { Message } from "discord.js";
import PaginationEmbed from "../../utils/PaginationEmbed";

export default class LeaderboardCommand extends Command {
	constructor() {
		super("leaderboard", {
			aliases: ["leaderboard"],
			description: "See the server Leaderboard",
			category: "Economy",
		});
	}

	async exec(message: Message): Promise<any> {
		const members = await this.client.economy.getGuild(message.guild!.id);

		if (!members.length)
			return message.channel.send({
				embeds: [
					this.error(message, "Invalid Members", "Nobody has coins!"),
				],
			});

		const leaderboardEmbed = new PaginationEmbed(message)
			.format((member: any) => {
				const index = members.findIndex(
					(m) => m.memberId == member.memberId
				);

				return `**${index}.** <@${member.memberId}>; **${member.coins} Coins**`;
			})
			.setFieldName("Leaderboard")
			.setExpireTime(60000);

		leaderboardEmbed.setEmbed({
			title: `${message.guild!.name} Coin Leaderboard ${
				this.client.emoji.coin
			}`,
			thumbnail: {
				url: message.author.displayAvatarURL({ dynamic: true }),
			},
		});

		await leaderboardEmbed.send(members, 8);
	}
}
