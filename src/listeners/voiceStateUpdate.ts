import Listener from "../struct/Listener";
import { VoiceState, Permissions, CategoryChannelResolvable } from "discord.js";
import { Collection } from "discord.js";

export default class VoiceStateUpdateListener extends Listener {
	constructor() {
		super("voiceStateUpdate", {
			emitter: "client",
			event: "voiceStateUpdate",
		});
	}

	async exec(before: VoiceState, after: VoiceState) {
		// Lobby Logic
		if (
			!this.client.settings.get(before.guild.id, "voiceLobbies", false) ||
			!this.client.settings.get(
				before.guild.id,
				"voiceLobbyChannel",
				null
			)
		)
			return;

		if (
			after.channelId !==
			this.client.settings.get(before.guild.id, "voiceLobbyChannel", null)
		) {
			const grabbed = this.client.voiceLobbies
				.get(before.guild.id)
				?.get(before.channelId!);
			if (!grabbed) return;

			if (!grabbed.channel.members.has(grabbed.owner)) {
				grabbed.channel.delete();
				this.client.voiceLobbies
					.get(before.guild.id)!
					.delete(before.channelId!);
			}

			return;
		}

		if (!after.channelId) return;

		const newChannel = await before.guild.channels.create(
			`${before.member!.user.username}'s Lobby`,
			{
				type: "GUILD_VOICE",
				parent: <CategoryChannelResolvable>after.channel!.parent,
				permissionOverwrites: [
					{
						id: before.member!.id,
						allow: [
							Permissions.FLAGS.MANAGE_CHANNELS,
							Permissions.FLAGS.MANAGE_ROLES,
						],
					},
				],
			}
		);

		if (!this.client.voiceLobbies.get(before.guild.id))
			this.client.voiceLobbies.set(before.guild.id, new Collection());

		this.client.voiceLobbies.get(before.guild.id)!.set(newChannel.id, {
			channel: newChannel,
			owner: before.member!.id,
		});

		before.member!.voice.setChannel(newChannel);
	}
}
