import express from "express";
import { User } from "discord.js";

const { supportInvite, prefix } = require("../../config.json");

import { manager, weblog } from "../index";

const router = express.Router();
router.get("/", async function (req, res) {
	try {
		const user: User = await (await manager.fetchClientValues("user"))[0];

		return res.render("wiki", {
			avatar: user.avatarURL,
			username: user.username,
			support: supportInvite,
		});
	} catch (err) {
		weblog.error(err);
	}
});

export default router;
