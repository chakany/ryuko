import express from "express";

import { manager, weblog } from "../index";

const router = express.Router();
router.get("/", async function (req, res) {
	try {
		res.render("index", {
			totalShards: manager.totalShards,
			totalServers: await manager.fetchClientValues("guilds.cache.size"),
			avatar: await (await manager.fetchClientValues("user"))[0].avatarURL,
			username: await (await manager.fetchClientValues("user"))[0].username,
		});
	} catch (err) {
		weblog.error(err);
	}
});

export default router;
