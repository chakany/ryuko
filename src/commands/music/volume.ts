import { Command } from "discord-akairo";
import { MessageEmbed } from "discord.js";
import { Message } from "discord.js";

export default class VolumeCommand extends Command {
	constructor() {
		super("volume", {
			aliases: ["volume", "vol"],
			description: "Changes the volume of the currently playing song",
			category: "Music",
			channel: "guild",
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
		try {
			const serverQueue = this.client.queue.get(message.guild!.id);
			if (serverQueue === undefined)
				return message.channel.send(
					this.client.error(
						message,
						this,
						"Invalid Usage",
						"There is no song currently playing"
					)
				);
			if (
				!message.member?.voice.channel ||
				message.member?.voice.channelID !==
					serverQueue.player?.voiceConnection.voiceChannelID
			)
				return message.channel.send(
					this.client.error(
						message,
						this,
						"Invalid Usage",
						"You have to be in the voice channel to change the volume!"
					)
				);
			const oldVolume = serverQueue.player.volume;
			if (!args.volume || typeof args.volume !== "number")
				return message.channel.send(
					new MessageEmbed({
						title: `Current Volume`,
						description: "`" + oldVolume + "`",
						color: message.guild?.me?.displayHexColor,
						timestamp: new Date(),
						footer: {
							text: message.author.tag,
							icon_url: message.author.displayAvatarURL({
								dynamic: true,
							}),
						},
					})
				);
			if (args.volume > 100)
				return message.channel.send(
					this.client.error(
						message,
						this,
						"Invalid Argument",
						"You cannot set a volume greater than 100!"
					)
				);
			serverQueue.player.setVolume(args.volume);
			await this.client.settings
				.set(message.guild!.id, "volume", args.volume)
				.catch((error) => {
					this.client.log.error(error);
					return message.channel.send(
						this.client.error(
							message,
							this,
							"An error occurred",
							"Note that the value you set has not been saved in permanent storage. It is probably too loud, Try setting a lower volume."
						)
					);
				});
			return message.channel.send(
				new MessageEmbed({
					title: `Volume Changed!`,
					description:
						"`" +
						oldVolume +
						"` :arrow_right: `" +
						args.volume +
						"`",
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
				})
			);
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
