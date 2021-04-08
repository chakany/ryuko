import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { ShoukakuPlayer } from "shoukaku";

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

	async exec(message: Message, args: any) {
		try {
			const queue = message.client.queue;
			const guild = message.guild;
			const serverQueue = queue.get(message.guild.id);

			const voiceChannel = message.member.voice.channel;
			if (!voiceChannel)
				return message.channel.send(
					Error(
						message,
						this,
						"Invalid Usage",
						"You are not in a voice channel!"
					)
				);

			const node = this.client.shoukaku.getNode();
			let data = await node.rest.resolve(args.song);
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

				queueContruct.voiceChannel = message.member?.voice.channel;

				queue.set(message.guild.id, queueContruct);

				queueContruct.songs.push(track);
				try {
					this.play(message, queueContruct.songs[0], node);
				} catch (err) {
					console.log(err);
					queue.delete(message.guild.id);
					return message.channel.send(
						Error(message, this, "An error occurred", error.message)
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
							icon_url: message.author.avatarURL({ dynamic: true }),
						},
						footer: {
							text: message.client.user?.tag,
							icon_url: message.client.user?.avatarURL({ dynamic: true }),
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
	async play(message: Message, track, node, player: ShoukakuPlayer = null) {
		try {
			const queue = message.client.queue;
			const serverQueue = queue.get(message.guild.id);
			if (!player)
				player = await node.joinVoiceChannel({
					guildID: message.guild.id,
					voiceChannelID: message.member.voice.channelID,
				});
			serverQueue.connection = player;
			player.voiceConnection.selfDeaf = true;
			player.voiceConnection.player.on("error", (error) => {
				console.error(error);
				message.channel.send(
					Error(message, this, "An error occurred", error.message)
				);
				player.disconnect();
			});
			for (const event of ["end", "closed", "nodeDisconnect"])
				player.on(event, () => {
					serverQueue.songs.shift();
					if (serverQueue.songs[0] !== undefined) {
						this.play(message, serverQueue.songs[0], node, player);
					} else {
						player.disconnect();
						queue.delete(message.guild.id);
						return;
					}
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
						icon_url: message.author.avatarURL({ dynamic: true }),
					},
					footer: {
						text: message.client.user?.tag,
						icon_url: message.client.user?.avatarURL({ dynamic: true }),
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
