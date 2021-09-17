import Command from "../../struct/Command";
import { Message } from "discord.js";
import { MessagePagination } from "@ryukobot/paginationembed";

export default class QueueCommand extends Command {
	constructor() {
		super("queue", {
			aliases: ["queue", "nowplaying"],
			description: "Gets the Song Queue",
			category: "Music",
		});
	}

	async exec(message: Message): Promise<any> {
		const serverQueue = this.client.queue.get(message.guild!.id);
		if (!serverQueue)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"There is nothing in the queue!"
					),
				],
			});

		const queueEmbed = new MessagePagination({
			message,
			embed: this.embed(
				{
					title: `Music Queue`,
					description: `**Currently Playing:** \`${serverQueue.tracks[0].info.title}\``,
				},
				message
			),
			itemsPerPage: 6,
			array: serverQueue.tracks as never[],
			title: "Songs",
			callbackfn: (song: any) => {
				const index = serverQueue.tracks.findIndex(
					(s) => s.info.identifier === song.info.identifier
				);
				if (index == 0 && !serverQueue.tracks[1])
					return "**Nothing else in the Queue**";
				else if (index == 0) return;
				else return `**${index}.** \`${song.info.title}\``;
			},
		});

		queueEmbed.build();
	}
}
