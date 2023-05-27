import { request } from 'undici';

export default function (url, guilds) {
	return request(process.env.METRIC_API_URL + url, {
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ guilds }),
	});
}
