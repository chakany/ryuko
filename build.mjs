#!/usr/bin/env -S yarn zx

const discord = require("discord.js");
const { AkairoClient, CommandHandler } = require("discord-akairo");
const ejs = require("ejs");
const path = require("path");

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
	case "clean":
		await clean();
		console.log(`${chalk.green("Finished")}: clean`);
		break;
	case "all":
	default:
		await buildBot();
		await buildSite();
}

async function clean() {
	return await fs.rm("./dist", { recursive: true, force: true });
}

async function buildBot() {
	await clean();
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

	let support = "/";

	if (config) support = config.supportInvite;

	fs.writeFile(
		`./dist/pages/index.html`,
		await ejs.renderFile("./app/pages/index.ejs", {
			totalServers: bot.guilds.cache.size,
			avatar,
			username: bot.user.username,
			support,
			invite: await bot.generateInvite({
				permissions: "ADMINISTRATOR",
			}),
		})
	);

	// Render all commands and categories
	for await (let [categoryId, category] of bot.commandHandler.categories) {
		const categoryName = categoryId.toLowerCase();
		await fs.mkdir(`dist/pages/commands/${categoryName}`);

		fs.writeFile(
			`./dist/pages/commands/${categoryName}/theFuckingIndex123131312.html`,
			await ejs.renderFile("./app/pages/commands.ejs", {
				categories,
				username: bot.user.username,
				avatar,
				prefix: config.prefix,
				command: null,
				category: Array.from(category.values()),
			})
		);

		for await (let [commandId, command] of category) {
			fs.writeFile(
				`./dist/pages/commands/${categoryName}/${commandId}.html`,
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

	// Render Wiki
	const Wiki = require("./dist/utils/wiki").default;
	const wiki = new Wiki(path.resolve("./app/wiki"));

	for await (const category of wiki.categories) {
		fs.mkdir(`dist/pages/wiki/${category.file}`);

		for await (const page of category.files) {
			fs.writeFile(
				`./dist/pages/wiki/${
					category.name ? `${category.file}/` : ""
				}${page.file.replace(".ejs", ".html")}`,
				await ejs.renderFile("./app/pages/wiki.ejs", {
					avatar,
					username: bot.user.username,
					page: path.resolve(
						wiki.dir,
						category.name ? `${category.file}/` : "",
						page.file
					),
					categories: wiki.categories,
				})
			);
		}
	}

	return bot.destroy();
}
