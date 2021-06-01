#!/usr/bin/env -S yarn zx

const discord = require("discord.js");
const { AkairoClient, CommandHandler } = require("discord-akairo");
const ejs = require("ejs");

let config = null;

try {
	config = require("./config.json");
} catch (error) {
	config = null;
}

// Make sure the config is present, if not do NOT build if we are not building JUST the bot
if (!config && process.argv.slice(-1)[0] !== "bot") {
	console.log(
		`${chalk.bgRed.white(
			"Error"
		)}: there is no config present, please refer to the README on configuring the bot.`
	);
	await $`exit 1`;
}

// Set zx paramaters
$.verbose = false;

// Client Struct
class Client extends AkairoClient {
	constructor() {
		super(
			{
				ownerID: config.ownerId,
			},
			{
				disableMentions: "everyone",
			}
		);

		this.commandHandler = new CommandHandler(this, {
			directory: "./dist/commands",
			prefix: config.prefix,
			aliasReplacement: /-/g,
			allowMention: true,
			handleEdits: true,
			commandUtil: true,
			ignorePermissions: config.ownerId,
			ignoreCooldown: config.ownerId,
		});

		this.commandHandler.loadAll();
	}
}

// Check the last argument for what we should build
switch (process.argv.slice(-1)[0]) {
	case "bot":
		await buildBot();
		break;
	case "site":
	case "web":
		await buildSite();
		break;
	case "all":
	default:
		await buildBot();
		await buildSite();
}

async function buildBot() {
	// Start a timer to collect how long it takes to build
	let label = `${chalk.green("Finished")}: bot in`;
	console.log(`${chalk.yellow("Starting")}: bot`);
	console.time(label);

	// Build the bot
	await $`npx tsc`.pipe(process.stdout);

	console.timeEnd(label);
	return;
}

async function buildSite() {
	let label = `${chalk.green("Finished")}: site in`;
	console.log(`${chalk.yellow("Starting")}: site`);
	console.time(label);

	await fs.rm("./dist/pages", { recursive: true, force: true });
	await fs.mkdir("./dist/pages");

	// Build all
	await Promise.all([
		$`npx sass src/styles:app/static/styles`.pipe(process.stdout),
		buildPages(),
	]);

	console.timeEnd(label);
	return;
}

async function buildPages() {
	const bot = new Client();

	try {
		await bot.login(config.token);
	} catch (error) {
		console.error(error);
	}

	const avatar = bot.user.displayAvatarURL({ dynamic: true });
	const categories = JSON.parse(
		JSON.stringify(bot.commandHandler.categories)
	);

	await fs.mkdir("dist/pages/commands");

	fs.writeFile(
		`./dist/pages/index.html`,
		await ejs.renderFile("./app/pages/index.ejs", {
			totalServers: bot.guilds.cache.size,
			avatar,
			username: bot.user.username,
		})
	);

	// Render all commands
	for await (let [categoryId, category] of bot.commandHandler.categories) {
		await fs.mkdir(`dist/pages/commands/${categoryId}`);

		for await (let [commandId, command] of category) {
			fs.writeFile(
				`./dist/pages/commands/${categoryId}/${commandId}.html`,
				await ejs.renderFile("./app/pages/commands.ejs", {
					categories,
					username: bot.user.username,
					avatar,
					prefix: config.prefix,
					command: command,
				})
			);
		}
	}

	return bot.destroy();
}
