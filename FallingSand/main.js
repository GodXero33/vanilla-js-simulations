import * as AnimatorModule from '../common/js/common.main.js';
import SandSim from './sand.sim.js';

AnimatorModule.setControllerProperty('commonWarnings', true);
AnimatorModule.setControllerProperty('autoPlay', true);

const sandSim = new SandSim();

const canvas = AnimatorModule.createCanvas({
	parent: document.getElementById('main-container'),
	update: () => sandSim.update(),
	draw: (ctx) => {
		ctx.fillStyle = '#121212';
		
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		sandSim.draw(ctx);
	},
	resize: (ctx) => sandSim.resize(canvas.width, canvas.height, ctx)
});

console.log(canvas, sandSim);

window.addEventListener('keyup', event => {
	if (event.code === 'Space') canvas.isPlaying ? canvas.pause() : canvas.play();
});

let mouse;
let sandAddInterval = null;

canvas.canvas.addEventListener('mousedown', (event) => {
	const rect = canvas.canvas.getBoundingClientRect();
	const x = Math.floor((event.x - rect.x) / sandSim.cellSize);
	const y = Math.floor((event.y - rect.y) / sandSim.cellSize);

	mouse = [x, y];

	sandAddInterval = setInterval(() => {
		sandSim.addSand(...mouse);
	}, 50);
});

canvas.canvas.addEventListener('mousemove', (event) => {
	const rect = canvas.canvas.getBoundingClientRect();
	const x = Math.floor((event.x - rect.x) / sandSim.cellSize);
	const y = Math.floor((event.y - rect.y) / sandSim.cellSize);

	mouse = [x, y];
});

window.addEventListener('mouseup', () => {
	clearInterval(sandAddInterval);
});
