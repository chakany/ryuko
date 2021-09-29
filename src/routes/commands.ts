import express from "express";
import { AkairoClient, CommandHandler } from "@ryukobot/discord-akairo";
import Command from "../struct/Command";
import path from "path";
import { Command as ICommand } from "./commands.d";

const router = express.Router();

class Client extends AkairoClient {
	public handler: CommandHandler;

	constructor() {
		super({
			intents: [],
		});

		this.handler = new CommandHandler(this, {
			directory: path.resolve(__dirname, "../commands"),
		});

		this.handler.loadAll();
	}
}

const client = new Client();

router.get("/", async function (req, res) {
	const categories: { [id: string]: ICommand[] } = {};

	client.handler.categories.map((category) => {
		categories[category.id] = [];

		category.map((command) => {
			const typedCommand = command as Command;

			const formattedCommand: ICommand = {
				id: typedCommand.id,
				aliases: typedCommand.aliases,
				description: typedCommand.description,
				ownerOnly: typedCommand.ownerOnly,
				adminOnly: typedCommand.adminOnly,
				modOnly: typedCommand.modOnly,
				userPermissions: typedCommand.userPermissions,
				clientPermissions: typedCommand.clientPermissions,
				cooldown: typedCommand.formattedCooldown,
				usage: typedCommand.usage,
			};

			categories[category.id].push(formattedCommand);
		});
	});

	res.status(200).send(categories);
});

export default router;
