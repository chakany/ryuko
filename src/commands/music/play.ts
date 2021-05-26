import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import spotify from "spotify-url-info";

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

	async exec(message: Message, args: any): Promise<any> {
		const queue = this.client.queue;

		if (
			queue.get(message.guild!.id) &&
			queue.get(message.guild!.id)?.paused == true
		) {
			const guild = queue.get(message.guild!.id);
			guild!.paused = false;
			return guild!.player?.setPaused(false);
		} else if (!args.song)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Arguments",
					"You must provide a search query, or a URL!"
				)
			);
		else if (message.member!.voice.channelID == null)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Usage",
					"You must join a voice channel first!"
				)
			);
		else if (
			queue.get(message.guild!.id) &&
			queue.get(message.guild!.id)?.player?.voiceConnection
				.voiceChannelID !== message.member?.voice.channelID
		)
			return message.channel.send(
				this.client.error(
					message,
					this,
					"Invalid Usage",
					"You must be in the same voice channel as the bot!"
				)
			);
		const node = this.client.shoukaku.getNode();

		if (!queue.get(message.guild!.id))
			queue.set(message.guild!.id, {
				player: null,
				tracks: [],
				paused: true,
				loop: false,
			});

		const guildQueue = queue.get(message.guild!.id)!;
		const embedToSend = new MessageEmbed({
			title: "Now Playing",
			color: message.guild?.me?.displayHexColor,
			timestamp: new Date(),
			footer: {
				text: message.author.tag,
				icon_url: message.author.displayAvatarURL({
					dynamic: true,
				}),
			},
		});
		if (
			this._checkURL(args.song) &&
			args.song.startsWith("https://open.spotify.com")
		) {
			const req = await spotify.getData(args.song);
			switch (req.type) {
				case "track":
					const data = await node.rest.resolve(
						`${req.name} - ${req.artists[0].name}`,
						"youtube"
					);
					if (data?.tracks[0])
						guildQueue.tracks.push(data?.tracks[0]);
					embedToSend.setAuthor(
						req.artists[0].name,
						undefined,
						req.artists[0].external_urls.spotify
					);
					embedToSend.setDescription(
						"[`" +
							data?.tracks[0].info.title +
							"`](" +
							data?.tracks[0].info.uri +
							")"
					);
					embedToSend.setURL(data?.tracks[0].info.uri!);
					embedToSend.setThumbnail(req.album.images[0].url);
					break;
				case "playlist":
					let playlistCount = 0;
					const playlistMessage = message.channel.send(
						new MessageEmbed({
							title:
								this.client.config.emojis.loading +
								"*Please wait..*",
							description: `I am adding all songs in this playlist to the queue, give me a minute. **${playlistCount}**/**${req.tracks.items.length} Added**`,
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
					let playlistDescription = "";
					embedToSend.setAuthor(
						`${req.name} - ${req.owner.display_name}`,
						undefined,
						req.owner.external_urls.spotify
					);
					embedToSend.setThumbnail(req.images[0].url);
					embedToSend.setURL(req.external_urls.spotify);
					for await (const song of req.tracks.items) {
						const data = await node.rest.resolve(
							`${song.track.name} - ${song.track.artists[0].name}`,
							"youtube"
						);
						if (data?.tracks[0])
							guildQueue.tracks.push(data?.tracks[0]);
						playlistCount++;
						await (
							await playlistMessage
						).edit(
							new MessageEmbed({
								title:
									this.client.config.emojis.loading +
									"*Please wait..*",
								description: `I am adding all songs in this playlist to the queue, give me a minute. **${playlistCount}**/**${req.tracks.items.length} Added**`,
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
						if (playlistCount == 0)
							playlistDescription =
								playlistDescription +
								"[`" +
								data?.tracks[0].info.title +
								"`](" +
								data?.tracks[0].info.uri +
								")";
						else if (playlistCount < 7)
							playlistDescription =
								playlistDescription +
								`\n**${playlistCount}:** ` +
								"[`" +
								data?.tracks[0].info.title +
								"`](" +
								data?.tracks[0].info.uri +
								")";
						else if (playlistCount == 7)
							playlistDescription =
								playlistDescription +
								`\nand **${req.tracks.total - 6}** more.`;
					}
					(await playlistMessage).delete();
					embedToSend.setThumbnail(req.images[0].url);
					embedToSend.setDescription(playlistDescription);
					break;
				case "album":
					let albumCount = 0;
					const albumMessage = message.channel.send(
						new MessageEmbed({
							title:
								this.client.config.emojis.loading +
								"*Please wait..*",
							description: `I am adding all songs in this album to the queue, give me a minute. **${albumCount}**/**${req.tracks.items.length} Added**`,
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
					let albumDescription = "";
					embedToSend.setAuthor(
						`${req.name} - ${req.artists[0].name}`,
						undefined,
						req.artists[0].external_urls.spotify
					);
					embedToSend.setThumbnail(req.images[0].url);
					embedToSend.setURL(req.external_urls.spotify);
					for await (const song of req.tracks.items) {
						const data = await node.rest.resolve(
							`${song.name} - ${song.artists[0].name}`,
							"youtube"
						);
						if (data?.tracks[0])
							guildQueue.tracks.push(data?.tracks[0]);
						albumCount++;
						(await albumMessage).edit(
							new MessageEmbed({
								title:
									this.client.config.emojis.loading +
									"*Please wait..*",
								description: `I am adding all songs in this album to the queue, give me a minute. **${albumCount}**/**${req.tracks.items.length} Added**`,
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
						if (albumCount == 0)
							albumDescription =
								albumDescription +
								"[`" +
								data?.tracks[0].info.title +
								"`](" +
								data?.tracks[0].info.uri +
								")";
						else if (albumCount < 7)
							albumDescription =
								albumDescription +
								`\n**${albumCount}:** ` +
								"[`" +
								data?.tracks[0].info.title +
								"`](" +
								data?.tracks[0].info.uri +
								")";
						else if (albumCount == 7)
							albumDescription =
								albumDescription +
								`\nand **${req.tracks.total - 6}** more.`;
					}
					await (await albumMessage).delete();
					embedToSend.setDescription(albumDescription);
			}
		} else if (!this._checkURL(args.song)) {
			const data = await node.rest.resolve(
				message.util?.parsed?.content!,
				"youtube"
			);
			if (data?.tracks[0]) guildQueue.tracks.push(data?.tracks[0]);
			embedToSend.setDescription("`" + data?.tracks[0].info.title + "`");
			embedToSend.setThumbnail(
				`https://img.youtube.com/vi/${data?.tracks[0].info.identifier}/default.jpg`
			);
			embedToSend.setURL(data?.tracks[0].info.uri!);
		} else {
			const data = await node.rest.resolve(
				message.util?.parsed?.content!
			);
			if (data?.playlistName) {
				let playlistCount = 0;
				let playlistDescription = "";
				for await (let track of data?.tracks) {
					if (playlistCount == 0)
						playlistDescription =
							playlistDescription +
							"[`" +
							track.info.title +
							"`](" +
							track.info.uri +
							")\n";
					else if (playlistCount < 7)
						playlistDescription =
							playlistDescription +
							`\n**${playlistCount}:** ` +
							"[`" +
							track.info.title +
							"`](" +
							track.info.uri +
							")";
					else if (playlistCount == 7)
						playlistDescription =
							playlistDescription +
							`\nand **${data?.tracks.length - 6}** more.`;
					playlistCount++;
				}
				guildQueue.tracks = [...data?.tracks];
				embedToSend.setDescription(playlistDescription);
			} else if (data?.tracks[0]) {
				embedToSend.setDescription(
					"`" + data?.tracks[0].info.title + "`"
				);
				guildQueue.tracks.push(data?.tracks[0]);
			}
			if (data?.tracks[0].info.uri?.startsWith("https://www.youtube.com"))
				embedToSend.setThumbnail(
					`https://img.youtube.com/vi/${data?.tracks[0].info.identifier}/default.jpg`
				);
			embedToSend.setURL(data?.tracks[0].info.uri!);
		}

		if (guildQueue.paused == true) {
			const player = await node.joinVoiceChannel({
				guildID: message.guild!.id,
				voiceChannelID: message.member!.voice.channelID!,
				deaf: true,
			});

			guildQueue.player = player;
			player.playTrack(guildQueue.tracks[0]);

			player.on("end", (reason) => {
				if (!guildQueue.loop) guildQueue.tracks.shift();
				if (guildQueue.tracks[0])
					return player.playTrack(guildQueue.tracks[0]);
				player.disconnect();
				return queue.delete(message.guild!.id);
			});

			player.on("error", (error) => {
				this.client.log.error(error);
				message.channel.send(
					this.client.error(
						message,
						this,
						"An error occurred",
						error.message
					)
				);
				player.disconnect();
				return queue.delete(message.guild!.id);
			});

			return message.channel.send(embedToSend);
		} else {
			embedToSend.setTitle("Added to Queue");
			return message.channel.send(embedToSend);
		}
	}
}
