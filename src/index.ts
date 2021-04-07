import Bot from "./bot";

const client = new Bot();

try {
	client.start();
} catch (e) {
	console.error(e);
}
