import express from "express";
import { Category, Command } from "discord-akairo";

const { prefix } = require("../../config.json");

import { manager, weblog } from "../index";

const router = express.Router();

router.get("/", async function (req, res) {
	res.redirect("commands/Configuration/disable");
});

router.get("/:category/:command", async function (req, res) {
	try {
		if (process.env.NODE_ENV !== "production") {
			if (
				!(await (
					await manager.fetchClientValues("commandHandler.categories")
				)[0].find(
					(category: any) =>
						category[0] &&
						category[0].categoryID ===
							req.params.category.charAt(0).toUpperCase() +
								req.params.category.slice(1)
				)) ||
				!(await (
					await manager.fetchClientValues("commandHandler.categories")
				)[0]
					.find(
						(category: any) =>
							category[0] &&
							category[0].categoryID ===
								req.params.category.charAt(0).toUpperCase() +
									req.params.category.slice(1)
					)
					.find(
						(command: Command) => command.id === req.params.command
					))
			)
				// If the command or category doesn't exist
				return res.sendStatus(404);
			res.render("commands", {
				categories: (
					await manager.fetchClientValues("commandHandler.categories")
				)[0],
				username: await (
					await manager.fetchClientValues("user")
				)[0].username,
				avatar: await (
					await manager.fetchClientValues("user")
				)[0].avatarURL,
				prefix: prefix,
				command: await (
					await manager.fetchClientValues("commandHandler.categories")
				)[0]
					.find(
						(category: any) =>
							category[0] &&
							category[0].categoryID ===
								req.params.category.charAt(0).toUpperCase() +
									req.params.category.slice(1)
					)
					.find(
						(command: Command) => command.id === req.params.command
					),
			});
		} else {
			if (!req.params.category || !req.params.command) res.status(404);

			res.sendFile(
				`${process.cwd()}/pages/commands/${req.params.category}/${
					req.params.command
				}.html`
			);
		}
	} catch (err) {
		weblog.error(err);
	}
});

export default router;
