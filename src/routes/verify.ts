import express from "express";
import axios from "axios";

import { manager, weblog, redis } from "../index";

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
	if (!req.query.state) return res.status(404).send("404 Missing Paramaters");
	let redisRes = await redis.getVerificationKey(req.query.state);
	if (!redisRes.userId) return res.status(404).send("404 Invalid Paramaters");
	if (!req.query.code) {
		res.redirect(
			new URL(
				`https://discord.com/oauth2/authorize?client_id=${clientID}&redirect_uri=${verificationRedirect}&response_type=code&scope=identify%20guilds&state=${req.query.state}`
			).toString()
		);
	} else if (req.query.code) {
		let tokens: TokenResponse;
		try {
			tokens = await getTokens(req.query.code);

			const user = await axios.get("https://discord.com/api/users/@me", {
				headers: {
					authorization: `${tokens.token_type} ${tokens.access_token}`,
				},
			});

			if (user.data.id !== redisRes.userId)
				res.render("verify", {
					verified: false,
					error: "You signed in with a different account than the one you initiated the verification with. Please make sure you login with the same account.",
				});
			else
				res.render("verify", {
					user: user.data,
					verified: false,
					error: null,
					siteKey: recaptchaSiteKey,
					state: req.query.state,
				});
		} catch (error) {
			weblog.error(error);
			res.status(500).send("500 Internal Server Error");
		}
	} else return res.status(404);
});

router.post("/", async (req, res) => {
	if (!req.body["g-recaptcha-response"] || !req.body.state)
		return res.status(400).send("Missing Parameters");

	try {
		const results = await checkCaptcha(req.body["g-recaptcha-response"]);

		if (results.success) {
			res.render("verify", {
				verified: true,
				error: null,
			});
			redis.publish(`verification-${req.body.state}`, "verified");
			redis.removeVerification(req.body.state);
		}
	} catch (error) {
		weblog.error(error);
		res.status(500).send("500 Internal Server Error");
	}
});

export default router;
