import express from "express";
import {
	AkairoClient,
	CommandHandler,
	Category,
	MissingPermissionSupplier,
} from "@ryukobot/discord-akairo";
import Command from "../struct/Command";
import { PermissionResolvable } from "discord.js";

import path from "path";

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

type Permissions =
	| PermissionResolvable
	| PermissionResolvable[]
	| MissingPermissionSupplier;

interface ICommand {
	id: string;
	aliases: string[];
	description: string;
	ownerOnly: boolean;
	adminOnly: boolean;
	modOnly: boolean;
	clientPermissions?: Permissions;
	userPermissions?: Permissions;
	cooldown: string | null;
	usage: string;
}

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
