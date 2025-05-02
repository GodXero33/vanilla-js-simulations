import * as AnimatorModule from '../common/js/common.main.js';

AnimatorModule.setControllerProperty('commonWarnings', true);
AnimatorModule.setControllerProperty('autoPlay', true);

const canvas = AnimatorModule.createCanvas({
	parent: document.getElementById('main-container'),
	update: () => {},
	draw: (ctx) => {
		ctx.fillStyle = '#121212';
		
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const transform = ctx.getTransform();
		
		ctx.translate(canvas.width * 0.5, canvas.height * 0.5);

		ctx.setTransform(transform);
	}
});

console.log(canvas);

window.addEventListener('keyup', event => {
	if (event.code === 'Space') canvas.isPlaying ? canvas.pause() : canvas.play();
});
