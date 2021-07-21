import express from "express";

const { supportInvite } = require("../../config.json");

import { manager, weblog, user } from "../index";

const router = express.Router();
router.get("/", async function (req, res) {
	try {
		if (process.env.NODE_ENV !== "production") {
			res.render("index", {
				totalServers: await manager.fetchClientValues(
					"guilds.cache.size"
				),
				avatar: user.avatarURL,
				username: user.username,
				support: supportInvite,
				invite: `https://discord.com/oauth2/authorize?client_id=${user.id}&permissions=8&scope=bot`,
			});
		} else res.sendFile(`${process.cwd()}/pages/index.html`);
	} catch (err) {
		weblog.error(err);
	}
});

export default router;
