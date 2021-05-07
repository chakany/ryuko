import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";

import Error from "../../utils/error";

const githubUrl = "https://api.github.com";

export default class GithubCommand extends Command {
	constructor() {
		super("github", {
			aliases: ["github"],
			description: "Gets a repository on GitHub",
			category: "Search",
			args: [
				{
					id: "repo",
					type: "string",
				},
			],
		});
	}

	async _getRepo(repo: string): Promise<AxiosResponse> {
		return axios.get(githubUrl + `/repos/${repo}`, {
			headers: {
				Accept: "application/vnd.github.v3+json",
			},
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.repo)
			return message.channel.send(
				Error(message, this, "Invalid Arguments", "You must provide a repo!")
			);
		let repo;
		try {
			const request = await this._getRepo(args.repo);
			repo = request.data;
		} catch (error) {
			return message.channel.send(
				Error(message, this, "Invalid Repo", "I could not find that repo!")
			);
		}

		return message.channel.send(
			new MessageEmbed({
				title: repo.name,
				url: repo.html_url,
				description: repo.description,
				color: 16716032,
				timestamp: new Date(),
				author: {
					name: repo.owner.login,
					icon_url: repo.owner.avatar_url,
				},
				footer: {
					text: message.author.tag,
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				fields: [
					{
						name: "Language",
						value: "`" + repo.language + "`",
						inline: true,
					},
					{
						name: "Forks",
						value: "`" + repo.forks_count + "`",
						inline: true,
					},
					{
						name: "Stars",
						value: "`" + repo.stargazers_count + "`",
						inline: true,
					},
					{
						name: "Watchers",
						value: "`" + repo.watchers_count + "`",
						inline: true,
					},
					{
						name: "Open Issues",
						value: "`" + repo.open_issues_count + "`",
						inline: true,
					},
					{
						name: "License",
						value: "`" + repo.license.name + "`",
						inline: true,
					},
					{
						name: "Default Branch",
						value: "`" + repo.default_branch + "`",
						inline: true,
					},
				],
			})
		);
	}
}
