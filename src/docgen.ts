// This file is a mess
// I don't want to ever touch it again

import bunyan from "bunyan";
import { Command } from "discord-akairo";
import fs from "fs";
import fsp from "fs/promises";
let botlog = bunyan.createLogger({ name: "bot" });
let log = bunyan.createLogger({ name: "docs" });

let prefix: string;
let token: string;

if (fs.existsSync("../config.json")) {
	const config = require("../config.json");
	prefix = config.prefix;
	token = config.token;
} else {
	prefix = "!";
	// @ts-expect-error
	token = process.env.AINA_TOKEN;
}

import Bot from "./struct/client";

const client = new Bot(botlog, false);

const commandPath = "../docs/commands";

async function removeDir(path: string) {
	try {
		if (fs.existsSync(path)) {
			const files = await fsp.readdir(path);

			if (files.length > 0) {
				files.forEach(async function (filename) {
					if ((await fsp.stat(path + "/" + filename)).isDirectory()) {
						removeDir(path + "/" + filename);
					} else {
						await fsp.unlink(path + "/" + filename);
					}
				});
				await fsp.rmdir(path);
			} else {
				await fsp.rmdir(path);
			}
		} else {
			console.log("Directory path not found.");
		}
		return true;
	} catch (error) {
		log.error(error);
	}
}

async function start() {
	return new Promise(async (resolve, reject) => {
		await removeDir(commandPath);
		if (!fs.existsSync(commandPath)) await fsp.mkdir(commandPath);
		// port enviroment variable can be used for token
		await client.login(token);
		await fsp.writeFile(
			"../docs/_coverpage.md",
			`![logo](${client.user?.avatarURL({
				dynamic: true,
			})})\n# Aina\n> A feature-packed Discord Bot that is easy to use\n\n- Currently Private\n\n[Commands](/commands/index)\n[Docs](#aina)`
		);
		await fsp.writeFile(commandPath + "/_sidebar.md", "");
		await fsp.writeFile(
			commandPath + "/index.md",
			"# Commands\nOn the side, you will find all of the commands and their categories."
		);
		await fsp.appendFile("../docs/commands/_sidebar.md", "* [Go Back](./)\n");
		client.commandHandler.categories.forEach(async (category) => {
			let sidebarAppendage = `* ${category.id}\n`;
			await fsp.mkdir(commandPath + "/" + category.id);
			category.forEach(async (command: Command) => {
				sidebarAppendage =
					sidebarAppendage +
					`   * [${
						command.aliases[0].charAt(0).toUpperCase() +
						command.aliases[0].slice(1)
					}](/commands/${category.id}/${command.aliases[0]})\n`;
				let usage: string = `${prefix}${command.aliases[0]}`;
				let current;
				// @ts-expect-error
				const args = command.args;
				// @ts-expect-error
				if (command.args !== undefined) {
					await new Promise((resolve, reject) => {
						for (let i = 0; (current = args[i]); i++) {
							usage = usage + ` <${current.id}>`;
						}
						resolve(true);
					});
				}
				let commandMarkdownFile = `# ${
					command.aliases[0].charAt(0).toUpperCase() +
					command.aliases[0].slice(1)
				} Command\n## Description\n${command.description}\n`;
				if (command.aliases[1])
					await new Promise((resolve, reject) => {
						commandMarkdownFile = commandMarkdownFile + "## Aliases\n";
						for (let i = 1; (current = command.aliases[i]); i++) {
							commandMarkdownFile = commandMarkdownFile + "`" + current + "` ";
						}
						commandMarkdownFile = commandMarkdownFile + "\n";

						resolve(true);
					});
				if (command.clientPermissions) {
					commandMarkdownFile =
						commandMarkdownFile + "## Required Bot Permissions\n";
					const permissions = command.clientPermissions.toString().split(",");
					for (let i = 0; (current = permissions[i]); i++) {
						commandMarkdownFile = commandMarkdownFile + "`" + current + "` ";
					}
					commandMarkdownFile = commandMarkdownFile + "\n";
				}
				if (command.userPermissions) {
					commandMarkdownFile =
						commandMarkdownFile + "## Required User Permissions\n";
					const permissions = command.userPermissions.toString().split(",");
					for (let i = 0; (current = permissions[i]); i++) {
						commandMarkdownFile = commandMarkdownFile + "`" + current + "` ";
					}
					commandMarkdownFile = commandMarkdownFile + "\n";
				}
				if (command.cooldown)
					commandMarkdownFile =
						commandMarkdownFile +
						"## Cooldown\n `" +
						command.cooldown +
						"`ms\n";
				if (command.ownerOnly)
					commandMarkdownFile =
						commandMarkdownFile + "## Bot Owner Only\n Yes\n";
				if (command.modOnly)
					commandMarkdownFile =
						commandMarkdownFile + "## Moderator Only\n Yes\n";
				if (command.nsfw)
					commandMarkdownFile =
						commandMarkdownFile + "## Only usable in NSFW Channels\n Yes\n";
				console.log(usage);
				await fsp.writeFile(
					commandPath + "/" + category.id + `/${command.aliases[0]}.md`,
					commandMarkdownFile + `## Usage\n` + "`" + usage + "`"
				);
				if (
					client.commandHandler.categories.array().pop()!.id === category.id &&
					category.array().pop()!.id === command.id
				)
					resolve(true);
			});
			await fsp.appendFile("../docs/commands/_sidebar.md", sidebarAppendage);
			console.log(category.id);
		});
	});
}

start().then(() => {
	process.exit(0);
});
