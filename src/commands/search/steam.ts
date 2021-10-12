import Command from "../../struct/Command";
import { Message } from "discord.js";
import axios, { AxiosResponse } from "axios";
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

	private getProfile(id: string): Promise<AxiosResponse<any>> {
		return axios.get(
			`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.client.config.steamApiKey}&steamids=${id}`,
		);
	}

	private getIdFromVanityUrl(vanityUrl: string): Promise<AxiosResponse<any>> {
		return axios.get(
			`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${this.client.config.steamApiKey}&vanityurl=${vanityUrl}`,
		);
	}

	async exec(message: Message, args: any): Promise<any> {
		let data;
		let idObj: steamid;

		if (!this.checkValidity(args.input)) {
			const vanityUrl = await this.getIdFromVanityUrl(args.input);

			if (this.checkValidity(vanityUrl.data.response.steamid)) {
				idObj = new steamid(vanityUrl.data.response.steamid);

				const profile = await this.getProfile(
					vanityUrl.data.response.steamid,
				);

				data = profile.data.response.players[0];
			} else {
				return message.channel.send({
					embeds: [
						this.error(
							message,
							"An Error Occurred",
							"I could not find that profile! Please check the spelling and try again.",
						),
					],
				});
			}
		} else {
			idObj = new steamid(args.input);

			const profile = await this.getProfile(idObj.getSteamID64());

			data = profile.data.response.players[0];
		}

		let status = "";

		switch (data.personastate) {
			case 0:
				status = `${this.client.emoji.invisible} Offline`;
				break;
			case 1:
				status = `${this.client.emoji.online} Online`;
				break;
			case 2:
				status = `${this.client.emoji.dnd} Busy`;
				break;
			case 3:
				status = `${this.client.emoji.idle} Away`;
				break;
			case 4:
				status = `${this.client.emoji.idle} Snooze`;
				break;
			case 5:
				status = `${this.client.emoji.online} Looking to Trade`;
				break;
			case 6:
				status = `${this.client.emoji.online} Looking to Play`;
				break;
		}

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: `${data.personaname}'s Profile`,
						url: data.profileurl,
						thumbnail: {
							url: data.avatarfull,
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
					},
					message,
				),
			],
		});
	}
}
