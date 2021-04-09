import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { ShoukakuPlayer } from "shoukaku";
import ystr from "ytsr";

import Error from "../../utils/error";

const arg = [
	{
		id: "song",
		type: "string",
	},
];

export default class PlayCommand extends Command {
	protected args = arg;

	constructor() {
		super("play", {
			aliases: ["play"],
			description: "Play music into your Voice Channel!",
			category: "Music",
			clientPermissions: ["SPEAK", "CONNECT"],
			args: arg,
			channel: "guild",
		});
	}

	_checkURL(string: string) {
		try {
			new URL(string);
			return true;
		} catch (error) {
			return false;
		}
	}

	async exec(message: Message, args: any): Promise<any> {
		try {
			// @ts-ignore
			const queue = message.client.queue;
			const guild = message.guild;
			const serverQueue = queue.get(message.guild!.id);
			if (serverQueue !== undefined && serverQueue.connection)
				return serverQueue.connection.setPaused(false);
			if (!message.util?.parsed?.content)
				return message.channel.send(
					Error(
						message,
						this,
						"Invalid Argument",
						"You must provide something to play! It can be a URL or a search query."
					)
				);
			const voiceChannel = message.member!.voice.channel;
			if (!voiceChannel)
				return message.channel.send(
					Error(
						message,
						this,
						"Invalid Usage",
						"You are not in a voice channel!"
					)
				);
			let url;
			if (this._checkURL(args.song)) url = args.song;
			else {
				// @ts-ignore
				const searchResults = await ystr(message.util?.parsed?.content, {
					limit: 2,
				});
				// @ts-ignore
				url = searchResults.items[0].url;
				if (!url)
					return message.channel.send(
						Error(
							message,
							this,
							"Search Failed",
							"I could not find that on YouTube"
						)
					);
			}
			const node = this.client.shoukaku.getNode();
			let data = await node.rest.resolve(url);
			if (!data) return;
			const track = data.tracks.shift();

			if (!serverQueue) {
				const queueContruct = {
					textChannel: message.channel,
					voiceChannel: voiceChannel,
					connection: null,
					songs: [],
					playing: true,
				};
				// @ts-ignore
				queueContruct.voiceChannel = message.member?.voice.channel;

				queue.set(message.guild!.id, queueContruct);

				// @ts-ignore
				queueContruct.songs.push(track);
				try {
					this.play(message, queueContruct.songs[0], node);
				} catch (err) {
					console.log(err);
					queue.delete(message.guild!.id);
					return message.channel.send(
						Error(message, this, "An error occurred", err.message)
					);
				}
			} else {
				serverQueue.songs.push(track);
				await message.channel.send(
					new MessageEmbed({
						title: `Added to Queue!`,
						description: "`" + track.info.title + "`",
						url: track.info.uri,
						color: 16716032,
						timestamp: new Date(),
						author: {
							name: message.author.tag,
							icon_url: message.author.avatarURL({ dynamic: true }) || "",
						},
						footer: {
							text: message.client.user?.tag,
							icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
						},
						fields: [
							{
								name: "Suggested by:",
								value: `<@${message.author.id}>`,
							},
						],
					})
				);
			}
		} catch (error) {
			console.log(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
	// @ts-ignore
	async play(message: Message, track, node, player: ShoukakuPlayer = null) {
		try {
			// @ts-ignore
			const queue = message.client.queue;
			const serverQueue = queue.get(message.guild!.id);
			if (!player) {
				player = await node.joinVoiceChannel({
					guildID: message.guild!.id,
					voiceChannelID: message.member!.voice.channelID,
					deaf: true,
				});
				console.log(
					await this.client.settings.get(message.guild!.id, "volume", 100)
				);
				player.setVolume(
					await this.client.settings.get(message.guild!.id, "volume", 100)
				);
				for (const event of ["end", "closed", "nodeDisconnect"]) {
					// @ts-ignore
					player.on(event, () => {
						serverQueue.songs.shift();
						if (event === "end")
							if (serverQueue.songs[0] !== undefined) {
								this.play(message, serverQueue.songs[0], node, player);
							} else {
								player.disconnect();
								queue.delete(message.guild!.id);
								return;
							}
						else if (event === "closed" || event === "nodeDisconnect") {
							player.disconnect();
							queue.delete(message.guild!.id);
							return;
						}
					});
				}
			}
			serverQueue.connection = player;
			player.voiceConnection.selfDeaf = true;
			player.voiceConnection.player.on("error", (error) => {
				console.error(error);
				message.channel.send(
					Error(message, this, "An error occurred", error.message)
				);
				player.disconnect();
			});
			await player.playTrack(track);
			await message.channel.send(
				new MessageEmbed({
					title: `Now Playing`,
					description: "`" + track.info.title + "`",
					url: track.info.uri,
					color: 16716032,
					timestamp: new Date(),
					author: {
						name: message.author.tag,
						icon_url: message.author.avatarURL({ dynamic: true }) || "",
					},
					footer: {
						text: message.client.user?.tag,
						icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
					},
					fields: [
						{
							name: "Suggested by:",
							value: `<@${message.author.id}>`,
						},
					],
				})
			);
		} catch (error) {
			console.error(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
}
