import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { any } from "sequelize/types/lib/operators";
import { ShoukakuPlayer } from "shoukaku";
const { getPreview } = require("spotify-url-info");
import ystr from "ytsr";

import Error from "../../utils/error";

export default class PlayCommand extends Command {
	constructor() {
		super("play", {
			aliases: ["play"],
			description:
				"Play music into your Voice Channel! Enter a search query, youtube, or spotify url!",
			category: "Music",
			clientPermissions: ["SPEAK", "CONNECT"],
			args: [
				{
					id: "song",
					type: "string",
				},
			],
			channel: "guild",
		});
	}

	private _checkURL(string: string) {
		try {
			new URL(string);
			return true;
		} catch (error) {
			return false;
		}
	}

	private async _search(query: string): Promise<string> {
		// @ts-ignore
		const searchResults = await ystr(query, {
			limit: 2,
		});
		// @ts-ignore
		return searchResults.items[0].url;
	}

	async exec(message: Message, args: any): Promise<any> {
		try {
			// @ts-ignore
			const queue = message.client.queue;
			const guild = message.guild;
			const serverQueue = queue.get(message.guild!.id);
			if (serverQueue !== undefined && serverQueue.connection && !args.song)
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
			if (this._checkURL(args.song)) {
				if (args.song.startsWith("https://open.spotify.com/")) {
					const spotifyResponse = await getPreview(args.song);
					if (spotifyResponse.type === "track")
						url = await this._search(
							`${spotifyResponse.track} - ${spotifyResponse.artist}`
						);
				} else {
					url = args.song;
				}
			} else {
				url = await this._search(message.util?.parsed?.content);
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
			const tracks = data.tracks;

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

				tracks.forEach((track: any) => {
					// @ts-ignore
					queueContruct.songs.push(track);
				});

				try {
					this._play(message, queueContruct.songs[0], node);
					if (data.type === "PLAYLIST")
						await message.channel.send(
							new MessageEmbed({
								title: `Now Playing Playlist`,
								description: "`" + data.playlistName + "`",
								url: args.song,
								color: message.guild?.me?.displayHexColor,
								timestamp: new Date(),
								footer: {
									text: message.author.tag,
									icon_url: message.author.displayAvatarURL({ dynamic: true }),
								},
								fields: [
									{
										name: "Suggested by:",
										value: `<@${message.author.id}>`,
									},
								],
							})
						);
					else
						await message.channel.send(
							new MessageEmbed({
								title: `Now Playing`,
								description: "`" + tracks[0].info.title + "`",
								url: tracks[0].info.uri,
								color: message.guild?.me?.displayHexColor,
								timestamp: new Date(),
								footer: {
									text: message.author.tag,
									icon_url: message.author.displayAvatarURL({ dynamic: true }),
								},
								fields: [
									{
										name: "Suggested by:",
										value: `<@${message.author.id}>`,
									},
								],
							})
						);
				} catch (err) {
					this.client.log.error(err);
					queue.delete(message.guild!.id);
					return message.channel.send(
						Error(message, this, "An error occurred", err.message)
					);
				}
			} else {
				tracks.forEach((track: any) => {
					// @ts-ignore
					serverQueue.songs.push(track);
				});
				if (data.type === "PLAYLIST")
					await message.channel.send(
						new MessageEmbed({
							title: `Added Playlist to Queue!`,
							description: "`" + data.playlistName + "`",
							url: args.song,
							color: message.guild?.me?.displayHexColor,
							timestamp: new Date(),
							footer: {
								text: message.author.tag,
								icon_url: message.author.displayAvatarURL({ dynamic: true }),
							},
							fields: [
								{
									name: "Suggested by:",
									value: `<@${message.author.id}>`,
								},
							],
						})
					);
				else
					await message.channel.send(
						new MessageEmbed({
							title: `Added to Queue!`,
							description: "`" + tracks[0].info.title + "`",
							url: tracks[0].info.uri,
							color: message.guild?.me?.displayHexColor,
							timestamp: new Date(),
							footer: {
								text: message.author.tag,
								icon_url: message.author.displayAvatarURL({ dynamic: true }),
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
			this.client.log.error(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
	// @ts-ignore
	async _play(message: Message, track, node, player: ShoukakuPlayer = null) {
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
				player.setVolume(
					await this.client.settings.get(message.guild!.id, "volume", 100)
				);
				for (const event of ["end", "closed", "nodeDisconnect"]) {
					// @ts-ignore
					player.on(event, () => {
						serverQueue.songs.shift();
						if (event === "end")
							if (serverQueue.songs[0] !== undefined) {
								this._play(message, serverQueue.songs[0], node, player);
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
				this.client.log.error(error);
				message.channel.send(
					Error(message, this, "An error occurred", error.message)
				);
				player.disconnect();
			});
			await player.playTrack(track);
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
}
