import express from "express";

const { supportInvite } = require("../../config.json");

import { manager, weblog } from "../index";

const router = express.Router();
router.get("/", async function (req, res) {
	try {
		if (process.env.NODE_ENV !== "production") {
			const user = await (await manager.fetchClientValues("user"))[0];

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
