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
		// wrap this in a function, we don't want to return lmao
		await (async () => {
			if (!this.client.settings.get(before.guild.id, "voiceLogs", false))
				return;

			if (!before.channel && after.channel) {
				// Compare values to eachother, try to find a change.

				// Assume that they joined a channel
				return this.client.sendToLogChannel(before.guild, "voice", {
					embeds: [
						this.embed(
							{
								title: "Member Joined VC",
								thumbnail: {
									url: after.member!.user.displayAvatarURL({
										dynamic: true,
									}),
								},
								footer: {},
								fields: [
									{
										name: "Member",
										value: after.member!.toString(),
									},
									{
										name: "Channel",
										value: after.channel.toString(),
									},
								],
							},
							before.member!.user,
							before.guild,
						),
					],
				});
			}

			// Assume that they left a channel
			if (before.channel && !after.channel) {
				const fetchedLogs = await after.guild.fetchAuditLogs({
					limit: 1,
					type: "MEMBER_DISCONNECT",
				});

				const disconnectLog = fetchedLogs.entries.first();

				if (!disconnectLog)
					return this.client.sendToLogChannel(before.guild, "voice", {
						embeds: [
							this.embed(
								{
									title: "Member Left VC",
									thumbnail: {
										url: before.member!.user.displayAvatarURL(
											{
												dynamic: true,
											},
										),
									},
									footer: {},
									fields: [
										{
											name: "Member",
											value: before.member!.toString(),
										},
										{
											name: "Channel",
											value: before.channel.toString(),
										},
									],
								},
								before.member!.user,
								before.guild,
							),
						],
					});

				const { executor } = disconnectLog;

				if (executor?.id === this.client.user!.id) return;

				return this.client.sendToLogChannel(before.guild, "voice", {
					embeds: [
						this.embed(
							{
								title: "Member Left VC",
								thumbnail: {
									url: before.member!.user.displayAvatarURL({
										dynamic: true,
									}),
								},
								footer: {},
								fields: [
									{
										name: "Member",
										value: before.member!.toString(),
									},
									{
										name: "Channel",
										value: before.channel.toString(),
									},
								],
							},
							before.member!.user,
							before.guild,
						),
					],
				});
			}

			// Assume that they moved channels
			if (
				before.channel &&
				after.channel &&
				before.channel?.id !== after.channel?.id
			) {
				// Fetch audit logs, see if we can get data
				const fetchedLogs = await after.guild.fetchAuditLogs({
					limit: 1,
					type: "MEMBER_MOVE",
				});

				const moveLog = fetchedLogs.entries.first();

				if (!moveLog)
					return this.client.sendToLogChannel(before.guild, "voice", {
						embeds: [
							this.embed(
								{
									title: "Member Moved VCs",
									thumbnail: {
										url: after.member!.user.displayAvatarURL(
											{
												dynamic: true,
											},
										),
									},
									footer: {},
									fields: [
										{
											name: "Member",
											value: after.member!.toString(),
										},
										{
											name: "From",
											value: before.channel.toString(),
											inline: true,
										},
										{
											name: "To",
											value: after.channel.toString(),
											inline: true,
										},
									],
								},
								before.member!.user,
								before.guild,
							),
						],
					});

				const { executor } = moveLog;

				if (executor?.id === this.client.user!.id) return;

				return this.client.sendToLogChannel(before.guild, "voice", {
					embeds: [
						this.embed(
							{
								title: "Member Moved VCs",
								thumbnail: {
									url: after.member!.user.displayAvatarURL({
										dynamic: true,
									}),
								},
								footer: {},
								fields: [
									{
										name: "Member",
										value: after.member!.toString(),
									},
									{
										name: "From",
										value: before.channel.toString(),
										inline: true,
									},
									{
										name: "To",
										value: after.channel.toString(),
										inline: true,
									},
								],
							},
							before.member!.user,
							before.guild,
						),
					],
				});
			}
		})();

		// Lobby Logic
		if (
			!this.client.settings.get(before.guild.id, "voiceLobbies", false) ||
			!this.client.settings.get(
				before.guild.id,
				"voiceLobbyChannel",
				null,
			)
		)
			return;

		if (
			before.channel &&
			this.client.voiceLobbies
				.get(before.channel!.guild.id)
				?.get(before.channel!.id)
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
		}

		if (
			after.channel?.id !==
			this.client.settings.get(before.guild.id, "voiceLobbyChannel", null)
		)
			return;

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
			},
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
