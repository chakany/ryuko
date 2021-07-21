import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import axios from "axios";
import steamid from "steamid";

export default class SteamCommand extends Command {
	constructor() {
		super("steam", {
			aliases: ["steam", "steamid"],
			description:
				"Get the profile information from a SteamID or a Vanity URL",
			category: "Search",
			args: [
				{
					id: "input",
					type: "string",
				},
			],
		});
	}

	private checkValidity(input: string) {
		try {
			const id = new steamid(input);
			return id;
		} catch (error) {
			return false;
		}
	}

	private getProfile(id: string) {
		return axios.get(
			`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.client.config.steamApiKey}&steamids=${id}`
		);
	}

	private getIdFromVanityUrl(vanityUrl: string) {
		return axios.get(
			`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${this.client.config.steamApiKey}&vanityurl=${vanityUrl}`
		);
	}

	async exec(message: Message, args: any): Promise<any> {
		try {
			let data;
			let idObj: steamid;

			if (!this.checkValidity(args.input)) {
				const vanityUrl = await this.getIdFromVanityUrl(args.input);

				if (this.checkValidity(vanityUrl.data.response.steamid)) {
					idObj = new steamid(vanityUrl.data.response.steamid);

					const profile = await this.getProfile(
						vanityUrl.data.response.steamid
					);

					data = profile.data.response.players[0];
				} else {
					return message.channel.send(
						this.client.error(
							message,
							this,
							"An Error Occurred",
							"I could not find that profile."
						)
					);
				}
			} else {
				idObj = new steamid(args.input);

				const profile = await this.getProfile(idObj.getSteamID64());

				data = profile.data.response.players[0];
			}

			let status;

			if (data.personastate === 0)
				status = `${this.client.config.emojis.invisible} Offline`;
			else if (data.personastate === 1)
				status = `${this.client.config.emojis.online} Online`;
			else if (data.personastate === 2)
				status = `${this.client.config.emojis.dnd} Busy`;
			else if (data.personastate === 3)
				status = `${this.client.config.emojis.idle} Away`;
			else if (data.personastate === 4)
				status = `${this.client.config.emojis.idle} Snooze`;
			else if (data.personastate === 5)
				status = `${this.client.config.emojis.online} Looking to Trade`;
			else if (data.personastate === 6)
				status = `${this.client.config.emojis.online} Looking to Play`;

			return message.channel.send(
				new MessageEmbed({
					title: `${data.personaname}'s Profile`,
					url: data.profileurl,
					color: message.guild?.me?.displayHexColor,
					timestamp: new Date(),
					thumbnail: {
						url: data.avatarfull,
					},
					footer: {
						text: message.author.tag,
						icon_url: message.author.displayAvatarURL({
							dynamic: true,
						}),
					},
					fields: [
						{
							name: "Current Status",
							value: status,
							inline: true,
						},
						{
							name: "Real Name",
							value: data.realname
								? `\`${data.realname}\``
								: "Unknown",
							inline: true,
						},
						{
							name: "Created At",
							value: `<t:${data.timecreated}:f>`,
							inline: true,
						},
						{
							name: "SteamID64",
							value: `\`${idObj.getSteamID64()}\``,
							inline: true,
						},
						{
							name: "SteamID2",
							value: `\`${idObj.getSteam2RenderedID()}\``,
							inline: true,
						},
						{
							name: "SteamID3",
							value: `\`${idObj.getSteam3RenderedID()}\``,
							inline: true,
						},
					],
				})
			);
		} catch (error) {
			return message.channel.send(
				this.client.error(
					message,
					this,
					"An Error Occurred",
					"I could not find that profile"
				)
			);
		}
	}
}
