import express from "express";
import axios, { AxiosResponse } from "axios";
import bcrypt from "bcrypt";
import Db from "../utils/db";
import { DiscordTokenResponse } from "./verify.d";

const db = new Db();

import { redis } from "../index";

const {
	clientID,
	clientSecret,
	siteUrl,
	recaptchaSecret,
	// eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("../../config.json");

async function getTokens(code: string): Promise<DiscordTokenResponse> {
	const req: AxiosResponse<DiscordTokenResponse> = await axios.post(
		"https://discord.com/api/oauth2/token",
		new URLSearchParams({
			client_id: clientID,
			client_secret: clientSecret,
			code,
			grant_type: "authorization_code",
			redirect_uri: `${siteUrl}/verify`,
			scope: "identify",
		}),
	);

	return req.data;
}

async function checkIp(ip: string): Promise<boolean> {
	const req: AxiosResponse<any> = await axios.get(
		"https://check.getipintel.net/check.php",
		{
			params: {
				ip,
				contact: "jack@chaker.net", // For status updates
				flags: "b", // Quickly, matches better with vpns/proxys
				format: "json",
			},
		},
	);

	if (req.data.status == "success" && 0.8 <= parseFloat(req.data.result))
		return true;

	return false;
}

async function checkCaptcha(response: string): Promise<boolean> {
	const req: AxiosResponse<any> = await axios.post(
		"https://www.google.com/recaptcha/api/siteverify",
		new URLSearchParams({
			secret: recaptchaSecret,
			response,
		}),
	);

	if (req.data.success) return true;

	return false;
}

const router = express.Router();

router.get("/:state", async (req, res) => {
	const redisRes = await redis.getVerificationKey(req.params.state);
	if (!redisRes.userId) return res.sendStatus(400);

	res.status(200).send({
		message: "REDIRECT",
		redirectUri: new URL(
			`https://discord.com/oauth2/authorize?client_id=${clientID}&redirect_uri=${siteUrl}/verify&response_type=code&scope=identify%20guilds&state=${req.params.state}`,
		).toString(),
	});
});

router.get("/:state/:code", async (req, res) => {
	const redisRes = await redis.getVerificationKey(req.params.state);
	if (!redisRes.userId) return res.sendStatus(400);

	let tokens: DiscordTokenResponse;

	try {
		tokens = await getTokens(req.params.code);
	} catch (error) {
		return res.sendStatus(500);
	}

	const requestedUser: AxiosResponse<any> = await axios.get(
		"https://discord.com/api/users/@me",
		{
			headers: {
				authorization: `${tokens.token_type} ${tokens.access_token}`,
			},
		},
	);

	if (requestedUser.data.id !== redisRes.userId) res.sendStatus(403);
	else
		res.status(200).send({
			message: "CAPTCHA",
			state: req.params.state,
			id: redisRes.userId,
			username: requestedUser.data.username,
			discriminator: requestedUser.data.discriminator,
			avatar: requestedUser.data.avatar
				? `https://cdn.discordapp.com/avatars/${requestedUser.data.id}/${requestedUser.data.avatar}`
				: `https://cdn.discordapp.com/embed/avatars/${requestedUser.data.discriminator}.png`,
		});
});

router.post("/:state", async (req, res) => {
	if (!req.body["g-recaptcha-response"] || !req.params.state || !req.body.id)
		return res.sendStatus(400);

	const results = await checkCaptcha(req.body["g-recaptcha-response"]);

	if (results) {
		const redisRes = await redis.getVerificationKey(req.params.state);

		const fetchedMember = await db.getMembersByIdentifier(
			req.cookies._verificationId,
			req.ip,
		);
		const current = new Date();
		current.setDate(current.getDate() - 14);

		// Check IP
		if (await checkIp(req.ip)) {
			res.status(200).send({
				message: "SUCCESS",
			});

			redis.publish(
				`verification-${req.params.state}`,
				JSON.stringify({
					message: "vpn",
				}),
			);
		} else if (
			(fetchedMember?.ipAddress &&
				fetchedMember.cookieId &&
				!(await bcrypt.compare(
					req.body.id,
					fetchedMember?.cookieId,
				))) ||
			(fetchedMember?.ipAddress == req.ip &&
				fetchedMember?.id !== req.body.id &&
				fetchedMember?.verifiedAt >= current)
		) {
			res.status(200).send({
				message: "SUCCESS",
			});

			redis.publish(
				`verification-${req.params.state}`,
				JSON.stringify({
					message: "alt",
					originalAccount: fetchedMember?.id,
				}),
			);
		} else {
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(redisRes.userId, salt);

			db.verifyMember(req.body.id, hash, req.ip!);
			res.cookie("_verificationId", hash).status(200).send({
				message: "SUCCESS",
			});
			redis.publish(
				`verification-${req.params.state}`,
				JSON.stringify({
					message: "verified",
				}),
			);
		}

		redis.removeVerification(req.params.state);
	}
});

export default router;
