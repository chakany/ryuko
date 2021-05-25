import express from "express";
import axios from "axios";

import { manager, weblog } from "../index";

const {
	clientID,
	clientSecret,
	verificationRedirect,
	recaptchaSecret,
	recaptchaSiteKey,
} = require("../../config.json");

interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

async function getTokens(code: any): Promise<TokenResponse> {
	try {
		const req = await axios.post(
			"https://discord.com/api/oauth2/token",
			new URLSearchParams({
				client_id: clientID,
				client_secret: clientSecret,
				code,
				grant_type: "authorization_code",
				redirect_uri: verificationRedirect,
				scope: "identify",
			})
		);
		return req.data;
	} catch (error) {
		throw new Error(error);
	}
}

async function checkCaptcha(response: any): Promise<any> {
	try {
		const req = await axios.post(
			"https://www.google.com/recaptcha/api/siteverify",
			new URLSearchParams({
				secret: recaptchaSecret,
				response,
			})
		);
		return req.data;
	} catch (error) {
		throw new Error(error);
	}
}

const router = express.Router();

// Our main route
router.get("/", async (req, res) => {
	if (req.query.id) {
		res.redirect(
			new URL(
				`https://discord.com/oauth2/authorize?client_id=${clientID}&redirect_uri=${verificationRedirect}&response_type=code&scope=identify%20guilds&state=${req.query.id}`
			).toString()
		);
	} else if (req.query.state && req.query.code) {
		let tokens: TokenResponse;
		try {
			tokens = await getTokens(req.query.code);

			const user = await axios.get("https://discord.com/api/users/@me", {
				headers: {
					authorization: `${tokens.token_type} ${tokens.access_token}`,
				},
			});

			res.render("verify", {
				user: user.data,
				verified: false,
				siteKey: recaptchaSiteKey,
			});
		} catch (error) {
			weblog.error(error);
			res.status(500).send("500 Internal Server Error");
		}
	} else {
		res.status(400).send("Missing Parameters");
	}
});

router.post("/", async (req, res) => {
	if (!req.body["g-recaptcha-response"])
		res.status(400).send("Missing Parameters");

	try {
		const results = await checkCaptcha(req.body["g-recaptcha-response"]);

		if (results.success)
			res.render("verify", {
				verified: true,
			});
	} catch (error) {
		weblog.error(error);
		res.status(500).send("500 Internal Server Error");
	}
});

export default router;
