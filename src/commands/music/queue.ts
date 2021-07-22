import Command from "../../struct/Command";
import { Message, TextChannel } from "discord.js";
import { FieldsEmbed } from "discord-paginationembed";

export default class QueueCommand extends Command {
	constructor() {
		super("queue", {
			aliases: ["queue", "nowplaying"],
			description: "Gets the Song Queue",
			category: "Music",
			clientPermissions: ["MANAGE_MESSAGES"],
		});
	}

	async exec(message: Message): Promise<any> {
		const serverQueue = this.client.queue.get(message.guild!.id);
		if (!serverQueue)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Usage",
					"There is nothing in the queue!"
				)
			);

		const queueEmbed = new FieldsEmbed()
			.setArray(serverQueue.tracks)
			.setChannel(<TextChannel>message.channel)
			.setAuthorizedUsers([message.author.id])
			.setElementsPerPage(6)
			.formatField("Songs", (song: any) => {
				const index = serverQueue.tracks.findIndex(
					(s) => s.info.identifier === song.info.identifier
				);
				if (index !== 0) return `**${index}:** \`${song.info.title}\``;
			})
			.setPage(1)
			.setPageIndicator(true)
			.setDisabledNavigationEmojis(["delete"]);

		queueEmbed.embed
			.setColor(message.guild!.me!.displayHexColor)
			.setTitle(`Song Queue`)
			.setDescription(
				`**Currently Playing:** \`${serverQueue.tracks[0].info.title}\``
			)
			.setTimestamp(new Date())
			.setFooter(
				message.author.tag,
				message.author.displayAvatarURL({ dynamic: true })
			);

		await queueEmbed.build();
	}
}
