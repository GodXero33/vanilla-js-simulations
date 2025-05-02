import * as AnimatorModule from '../common/js/common.main.js';
import Pendulum from './pendulum.js';
import * as dat from '../common/js/lib/dat.gui.module.js';

AnimatorModule.setControllerProperty('commonWarnings', true);
AnimatorModule.setControllerProperty('autoPlay', true);

const pendulum = new Pendulum(300);
const gui = new dat.GUI();

const pendulumFolder = gui.addFolder('Pendulum Controls');

pendulumFolder.add(pendulum, 'length', 100, 1000).onChange(val => {
	pendulum.length = val;

	pendulum.update();
});

pendulumFolder.add(pendulum, 'gravity', 0.1, 20).step(0.1);
pendulumFolder.add(pendulum, 'frictionFact', 0, 0.1).step(0.001);
pendulumFolder.add(pendulum, 'mass', 0, 100).step(1);
pendulumFolder.add(pendulum, 'drawHistory');
pendulumFolder.add({ reset: () => pendulum.reset() }, 'reset');
pendulumFolder.add({ pause: () => { canvas.isPlaying ? canvas.pause() : canvas.play(); } }, 'pause').name('play / pause');

pendulumFolder.open();

function drawEnergy (ctx, label, energy, y) {
	ctx.font = '18px Arial';
	ctx.textBaseline = 'middle';

	const energyStr =  `${label}: ${energy.toFixed(3)} J`;
	const textMeasure = ctx.measureText(energyStr);
	const padding = 10;
	const textWidth = textMeasure.width + padding * 2;
	const textHeight = textMeasure.actualBoundingBoxAscent + textMeasure.actualBoundingBoxDescent + padding * 2;

	ctx.fillStyle = '#232323';
	ctx.fillRect(0, textHeight * y, textWidth, textHeight);

	ctx.fillStyle = '#ffffff';
	ctx.fillText(energyStr, padding, textHeight * (y + 0.5));
}

const canvas = AnimatorModule.createCanvas({
	parent: document.getElementById('main-container'),
	update: () => {
		pendulum.update();
	},
	draw: (ctx) => {
		ctx.fillStyle = '#121212';

		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const transform = ctx.getTransform();

		ctx.translate(canvas.width * 0.5, 0);
		pendulum.draw(ctx);
		ctx.setTransform(transform);

		const energies = pendulum.getEnergies();

		drawEnergy(ctx, 'Kinetic Energy', energies.kinetic, 0);
		drawEnergy(ctx, 'Potential Energy', energies.potential, 1);
		drawEnergy(ctx, 'Total Energy', energies.total, 2);
		drawEnergy(ctx, 'Energy lost', energies.lost, 3);
	}
});

console.log(canvas);

window.addEventListener('keyup', event => {
	if (event.code === 'Space') canvas.isPlaying ? canvas.pause() : canvas.play();
});
