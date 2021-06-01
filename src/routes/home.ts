import express from "express";

import { manager, weblog } from "../index";

const router = express.Router();
router.get("/", async function (req, res) {
	try {
		if (process.env.NODE_ENV !== "production")
			res.render("index", {
				totalServers: await manager.fetchClientValues(
					"guilds.cache.size"
				),
				avatar: await (
					await manager.fetchClientValues("user")
				)[0].avatarURL,
				username: await (
					await manager.fetchClientValues("user")
				)[0].username,
			});
		else res.sendFile(`${process.cwd()}/pages/index.html`);
	} catch (err) {
		weblog.error(err);
	}
});

export default router;
