import express from "express";
import { manager, log } from "../index";

const router = express.Router();

router.get("/", async function (req, res) {
	try {
		res.render("home", {
			totalShards: manager.totalShards,
			totalServers: await manager.fetchClientValues("guilds.cache.size"),
			avatar: await (await manager.fetchClientValues("user"))[0].avatarURL,
			username: await (await manager.fetchClientValues("user"))[0].username,
		});
	} catch (err) {
		log.error(err);
	}
});

export default router;
