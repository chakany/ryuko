import express from "express";

const { supportInvite } = require("../../config.json");

import { weblog, user } from "../index";

const router = express.Router();
router.get("/", async function (req, res) {
	try {
		return res.render("wiki", {
			avatar: user.avatarURL,
			username: user.username,
			support: supportInvite,
		});
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

export default router;
