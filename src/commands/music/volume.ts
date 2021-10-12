import Command from "../../struct/Command";
import { Message } from "discord.js";

export default class VolumeCommand extends Command {
	constructor() {
		super("volume", {
			aliases: ["volume", "vol"],
			description: "Changes the volume of the currently playing song",
			category: "Music",

			args: [
				{
					id: "volume",
					type: "number",
					default: true,
				},
			],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const serverQueue = this.client.queue.get(message.guild!.id);
		if (serverQueue === undefined)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"There is no song currently playing",
					),
				],
			});
		if (
			!message.member?.voice.channel ||
			message.member?.voice.channelId !==
				serverQueue.player?.connection.channelId
		)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"You have to be in the voice channel to change the volume!",
					),
				],
			});
		const volume = args.volume / 100;
		const oldVolume = serverQueue.player.filters.volume * 100;
		if (!args.volume || typeof args.volume !== "number")
			return message.channel.send({
				embeds: [
					this.embed(
						{
							title: `Current Volume`,
							description: "`" + oldVolume + "`",
						},
						message,
					),
				],
			});
		if (volume > 100)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Argument",
						"You cannot set a volume greater than 100!",
					),
				],
			});
		serverQueue.player.setVolume(volume);
		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: `Volume Changed!`,
						description:
							"`" +
							oldVolume +
							"` :arrow_right: `" +
							args.volume +
							"`",
					},
					message,
				),
			],
		});
	}
}
