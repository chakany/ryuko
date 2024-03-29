import Command from "../../struct/Command";
import { Message } from "discord.js";
import axios, { AxiosResponse } from "axios";

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

	_getRepo(repo: string): Promise<AxiosResponse<any>> {
		return axios.get(githubUrl + `/repos/${repo}`, {
			headers: {
				Accept: "application/vnd.github.v3+json",
			},
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.repo)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Arguments",
						"You must provide a repo!",
					),
				],
			});
		let repo;
		try {
			const request = await this._getRepo(args.repo);
			repo = request.data;
		} catch (error) {
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Repo",
						"I could not find that repo!",
					),
				],
			});
		}

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: repo.name,
						url: repo.html_url,
						description: repo.description,
						author: {
							name: repo.owner.login,
							icon_url: repo.owner.avatar_url,
							url: repo.owner.html_url,
						},
						fields: [
							{
								name: "Language",
								value: repo.language
									? `[${repo.language}](${new URL(
											`https://www.google.com/search?q=${repo.language} Programming Language`,
									  )})`
									: "None",
								inline: true,
							},
							{
								name: "Forks",
								value: `[${repo.forks_count}](${repo.html_url}/network/members)`,
								inline: true,
							},
							{
								name: "Stars",
								value: `[${repo.stargazers_count}](${repo.html_url}/stargazers)`,
								inline: true,
							},
							{
								name: "Watchers",
								value: `[${repo.watchers_count}](${repo.html_url}/watchers)`,
								inline: true,
							},
							{
								name: "Open Issues",
								value: `[${repo.open_issues_count}](${repo.html_url}/issues)`,
								inline: true,
							},
							{
								name: "License",
								value: `${
									repo.license
										? `[${repo.license.name}](https://opensource.org/licenses/${repo.license.spdx_id})`
										: "None"
								}`,
								inline: true,
							},
							{
								name: "Default Branch",
								value: `[${repo.default_branch}](${repo.html_url}/tree/${repo.default_branch})`,
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
