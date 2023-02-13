import declOfNum from './declOfNum';

export default function (date = new Date(), now = new Date()) {
	const difference = (date - now) / 1000;
	const seconds = Math.round(difference % 60);
	const minutes = Math.round(difference / 60) % 60;
	const hours = Math.round(difference / 3600) % 24;
	const days = Math.round(difference / 86400);

	if (days !== 0) return `${days} ${declOfNum(days, ['день', 'дня', 'дней'])}`;
	if (hours !== 0) return `${hours} ${declOfNum(hours, ['час', 'часа', 'часов'])}`;
	if (minutes !== 0) return `${minutes} ${declOfNum(minutes, ['минуту', 'минуты', 'минут'])}`;
	return `${seconds} ${declOfNum(seconds, ['секунду', 'секунды', 'секунд'])}`;
}
