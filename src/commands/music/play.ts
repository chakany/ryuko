import Command from "../../struct/Command";
import { Message } from "discord.js";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ShoukakuTrack = require("../../../node_modules/shoukaku/src/struct/ShoukakuTrack");

export default class PlayCommand extends Command {
	constructor() {
		super("play", {
			aliases: ["play", "p"],
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
			queue.get(message.guild!.id)?.paused == true &&
			!args.song
		) {
			const guild = queue.get(message.guild!.id);
			guild!.paused = false;
			return guild!.player?.setPaused(false);
		} else if (!args.song)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Arguments",
						"You must provide a search query, or a URL!",
					),
				],
			});
		else if (message.member!.voice.channelId == null)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"You must join a voice channel first!",
					),
				],
			});
		else if (
			queue.get(message.guild!.id) &&
			queue.get(message.guild!.id)?.player?.connection.channelId !==
				message.member?.voice.channelId &&
			queue.get(message.guild!.id)?.player
		)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Usage",
						"You must be in the same voice channel as me!",
					),
				],
			});
		const node = this.client.shoukaku.getNode();

		if (!queue.get(message.guild!.id))
			queue.set(message.guild!.id, {
				player: null,
				tracks: [],
				paused: true,
				loop: false,
			});

		const guildQueue = queue.get(message.guild!.id)!;
		const sentMessage = await message.channel.send({
			embeds: [
				this.embed(
					{
						title: `${this.client.emoji.loading} *Please Wait..*`,
						description:
							"I am searching for your song(s), if you queued a big playlist this will take a minute!",
					},
					message,
				),
			],
		});
		const embedToSend = this.embed(
			{
				title: "Now Playing",
			},
			message,
		);

		// Make embeds more stylish lolol
		if (
			this._checkURL(args.song) &&
			args.song.startsWith("https://open.spotify.com")
		) {
			try {
				const lavasfy = this.client.lavasfy;
				await lavasfy.requestToken();
				const lavasfyNode = lavasfy.nodes.get(node.name);

				const response = await lavasfyNode?.load(args.song);

				switch (response?.loadType) {
					case "TRACK_LOADED": {
						console.log(response.tracks[0]);
						guildQueue.tracks.push(
							new ShoukakuTrack(response.tracks[0]),
						);
						embedToSend.setDescription(
							`\`${response.tracks[0].info.title} - ${response?.tracks[0].info.author}\``,
						);
						embedToSend.setURL(response.tracks[0].info.uri);
						embedToSend.setThumbnail(
							response.metadata.album.images[0].url,
						);
						break;
					}
					case "PLAYLIST_LOADED": {
						for (const track of response.tracks) {
							guildQueue.tracks.push(new ShoukakuTrack(track));
						}
						let playlistCount = 0;
						let playlistDescription = "";
						for await (const track of response.tracks) {
							if (playlistCount == 0)
								playlistDescription =
									playlistDescription +
									`\`${track.info.title} - ${track.info.author}\`\n`;
							else if (playlistCount < 7)
								playlistDescription =
									playlistDescription +
									`\n**${playlistCount}.** \`${track.info.title} - ${track.info.author}\``;
							else if (playlistCount == 7)
								playlistDescription =
									playlistDescription +
									`\nand **${
										response.tracks.length - 6
									}** more.`;
							playlistCount++;
						}
						embedToSend.setDescription(playlistDescription);
						embedToSend.setThumbnail(
							response.metadata.images[0].url,
						);
						embedToSend.setURL(args.song);
						break;
					}
					case "LOAD_FAILED":
					case "NO_MATCHES":
						return message.channel.send({
							embeds: [
								this.error(
									message,
									"An error occurred",
									"I could not play that, try again?",
								),
							],
						});
				}
			} catch (error) {
				this.client.log.error(error);
				return sentMessage.edit({
					embeds: [
						this.error(
							message,
							"An error occurred",
							"I could not play that, try again?",
						),
					],
				});
			}
		} else if (!this._checkURL(args.song)) {
			const data = await node.rest.resolve(
				message.util!.parsed!.content!,
				"youtube",
			);
			if (!data)
				return sentMessage.edit({
					embeds: [
						this.error(
							message,
							"An error occurred",
							"I could not play that, try again?",
						),
					],
				});
			if (data?.tracks[0]) guildQueue.tracks.push(data?.tracks[0]);
			embedToSend.setDescription("`" + data?.tracks[0].info.title + "`");
			embedToSend.setThumbnail(
				`https://img.youtube.com/vi/${data?.tracks[0].info.identifier}/default.jpg`,
			);
			embedToSend.setURL(data!.tracks[0].info.uri!);
		} else {
			const data = await node.rest.resolve(
				message.util!.parsed!.content!,
			);
			if (!data)
				return sentMessage.edit({
					embeds: [
						this.error(
							message,
							"An error occurred",
							"I could not play that, try again?",
						),
					],
				});
			if (data?.playlistName) {
				let playlistCount = 0;
				let playlistDescription = "";
				for await (const track of data?.tracks) {
					if (playlistCount == 0)
						playlistDescription =
							playlistDescription + `\`${track.info.title}\`\n`;
					else if (playlistCount < 7)
						playlistDescription =
							playlistDescription +
							`\n**${playlistCount}.** \`${track.info.title}\``;
					else if (playlistCount == 7)
						playlistDescription =
							playlistDescription +
							`\nand **${data?.tracks.length - 6}** more.`;
					playlistCount++;
				}
				for (const track of data?.tracks) {
					guildQueue.tracks.push(new ShoukakuTrack(track));
				}
				embedToSend.setDescription(playlistDescription);
			} else if (data?.tracks[0]) {
				embedToSend.setDescription(`\`${data?.tracks[0].info.title}\``);
				guildQueue.tracks.push(data?.tracks[0]);
			}
			if (data?.tracks[0].info.uri?.startsWith("https://www.youtube.com"))
				embedToSend.setThumbnail(
					`https://img.youtube.com/vi/${data?.tracks[0].info.identifier}/default.jpg`,
				);
			embedToSend.setURL(data!.tracks[0].info.uri!);
		}

		if (!guildQueue.player) {
			const player = await node.joinChannel({
				guildId: message.guild!.id,
				channelId: message.member!.voice.channelId!,
				shardId: message.guild!.shardId,
				deaf: true,
			});

			guildQueue.player = player;
			player.playTrack(guildQueue.tracks[0]);
			guildQueue.paused = false;

			player.on("end", (reason) => {
				if (!guildQueue.loop) guildQueue.tracks.shift();
				if (guildQueue.tracks[0])
					return player.playTrack(guildQueue.tracks[0]);
				player.connection.disconnect();
				return queue.delete(message.guild!.id);
			});

			player.on("error", (error) => {
				this.client.log.error(error);
				message.channel.send({
					embeds: [
						this.error(message, "An error occurred", error.message),
					],
				});
				player.connection.disconnect();
				return queue.delete(message.guild!.id);
			});

			player.on("exception", (reason: any) => {
				message.channel.send({
					embeds: [
						this.error(
							message,
							"An error occurred",
							`\`\`\`${reason.exception.message}\n${reason.exception.cause}\`\`\``,
						),
					],
				});
			});

			return sentMessage.edit({
				embeds: [embedToSend],
			});
		} else {
			embedToSend.setTitle("Added to Queue");
			return sentMessage.edit({
				embeds: [embedToSend],
			});
		}
	}
}
