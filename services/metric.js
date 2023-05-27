import { request } from 'undici';

export default function (url, guilds) {
	return request(process.env.METRIC_API_URL + url, { body: JSON.stringify({ guilds }) });
}
