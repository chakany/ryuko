import express from "express";
import Command from "../struct/Command";

const { prefix } = require("../../config.json");

import { manager, weblog, user } from "../index";

const router = express.Router();

router.get("/", async function (req, res) {
	try {
		res.redirect("commands/Configuration");
	} catch (err) {
		weblog.error(err);
		return res.status(500).render("error", {
			username: user.username,
			avatar: user.avatarURL,
			code: 500,
			description: "Internal Server Error",
		});
	}
});

router.get("/:category", async function (req, res) {
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
				))
			)
				return res.sendStatus(404).render("error", {
					username: user.username,
					avatar: user.avatarURL,
					code: 404,
					description: "Page not Found",
				});

			res.render("commands", {
				categories: (
					await manager.fetchClientValues("commandHandler.categories")
				)[0],
				username: user.username,
				avatar: user.avatarURL,
				category: await (
					await manager.fetchClientValues("commandHandler.categories")
				)[0].find(
					(category: any) =>
						category[0] &&
						category[0].categoryID ===
							req.params.category.charAt(0).toUpperCase() +
								req.params.category.slice(1)
				),
			});
		} else {
			if (
				!(await (
					await manager.fetchClientValues("commandHandler.categories")
				)[0].find(
					(category: any) =>
						category[0] &&
						category[0].categoryID ===
							req.params.category.charAt(0).toUpperCase() +
								req.params.category.slice(1)
				))
			)
				return res.status(404).render("error", {
					username: user.username,
					avatar: user.avatarURL,
					code: 404,
					description: "Page not Found",
				});

			res.sendFile(
				`${process.cwd()}/pages/commands/${req.params.category.toLowerCase()}/theFuckingIndex123131312.html`
			);
		}
	} catch (err) {
		weblog.error(err);
	}
});

export default router;
