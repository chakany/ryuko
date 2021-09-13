import express from "express";
import {
	AkairoClient,
	CommandHandler,
	Category,
} from "@ryukobot/discord-akairo";

const { prefix } = require("../../config.json");

import { manager, weblog, user } from "../index";
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

const temp = new Client();

router.get("/", async function (req, res) {
	res.redirect("commands/Configuration");
});

router.get("/:category", async function (req, res) {
	try {
		if (
			!temp.handler.categories.find(
				(category) =>
					category.size > 0 &&
					category.first()!.categoryID ===
						req.params.category.charAt(0).toUpperCase() +
							req.params.category.slice(1)
			)
		)
			return res.sendStatus(404).render("error", {
				username: user.username,
				avatar: user.avatarURL,
				code: 404,
				description: "Page not Found",
			});

		res.render("commands", {
			categories: Array.from(temp.handler.categories.values()),
			username: user.username,
			avatar: user.avatarURL,
			category: Array.from(
				temp.handler.categories
					.find(
						(category) =>
							category.size > 0 &&
							category.first()!.categoryID ===
								req.params.category.charAt(0).toUpperCase() +
									req.params.category.slice(1)
					)
					?.values() as any
			),
		});
	} catch (error) {
		weblog.error(error);
	}
});

export default router;
