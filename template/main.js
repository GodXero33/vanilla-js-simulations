setControllerProperty('commonWarnings', true);
setControllerProperty('autoPlay', true);

class Dummy {
	constructor (x, y, r, v, color) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.v = v;
		this.t = 0;
		this.color = color;
	}

	update () {
		this.t += this.v;
		this.x = this.r * Math.cos(this.t);
		this.y = this.r * Math.sin(this.t);
	}

	draw (ctx) {
		ctx.fillStyle = this.color;

		ctx.beginPath();
		ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
		ctx.fill();
	}
}

const dummies = [];
const canvas = createCanvas({
	parent: document.getElementById('main-container'),
	update: () => {
		dummies.forEach(dummy => dummy.update());
	},
	draw: (ctx) => {
		ctx.fillStyle = '#121212';
		
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const transform = ctx.getTransform();
		
		ctx.translate(canvas.width * 0.5, canvas.height * 0.5);

		dummies.forEach(dummy => dummy.draw(ctx));

		ctx.setTransform(transform);
	}
});

for (let a = 0; a < 10; a++) {
	dummies.push(new Dummy(0, 0, 30 + a * 25, 0.01, '#f00'));
}

window.addEventListener('keyup', event => {
	if (event.code === 'Space') canvas.isPlaying ? canvas.pause() : canvas.play();
});
