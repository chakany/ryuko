import express from "express";

const { prefix } = require("../../config.json");

import { manager, weblog } from "../index";

const router = express.Router();
router.get("/", async function (req, res) {
	try {
		res.render("commands", {
			categories: (
				await manager.fetchClientValues("commandHandler.categories")
			)[0],
			username: await (await manager.fetchClientValues("user"))[0].username,
			avatar: await (await manager.fetchClientValues("user"))[0].avatarURL,
			prefix: prefix,
		});
	} catch (err) {
		weblog.error(err);
	}
});

export default router;
