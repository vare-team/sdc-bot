import randomInt from '../utils/random';
import { colors, types } from '../models/captcha';
import canvas from 'canvas';

const { createCanvas } = canvas;

export default function (code) {
	const canvas = createCanvas(300, 80);
	const ctx = canvas.getContext('2d');
	const letters = code.toString();

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	let startPixel = randomInt(0, 80);

	ctx.fillStyle = '#202225';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (const letter of letters) {
		ctx.beginPath();
		ctx.moveTo(0, randomInt(0, canvas.height));
		ctx.lineWidth = 1;
		ctx.setLineDash([]);
		ctx.strokeStyle = 'black';
		ctx.quadraticCurveTo(randomInt(-50, 50), randomInt(0, canvas.height), canvas.width, randomInt(0, 80));
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(0, randomInt(0, canvas.height));
		ctx.lineWidth = 3;
		ctx.strokeStyle = colors[randomInt(0, colors.length - 1)];
		ctx.setLineDash([randomInt(0, 5), randomInt(0, 2)]);
		ctx.quadraticCurveTo(randomInt(-50, 50), randomInt(0, canvas.height), canvas.width, randomInt(0, 80));
		ctx.stroke();

		ctx.font = `${types[randomInt(0, types.length - 1)]} 48px arial`;
		if (randomInt(0, 1) === 0) {
			ctx.fillStyle = colors[randomInt(0, colors.length - 1)];
			ctx.fillText(letter, startPixel, randomInt(40, 80));
		} else {
			ctx.setLineDash([randomInt(2, 10), 1]);
			ctx.strokeStyle = colors[randomInt(0, colors.length - 1)];
			ctx.strokeText(letter, startPixel, randomInt(40, 80));
		}

		startPixel += ctx.measureText(letter).width + randomInt(0, 25);
	}

	return canvas.toBuffer();
}
