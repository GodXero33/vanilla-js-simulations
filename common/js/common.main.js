let secretKey = `${Array.from({ length: 4 }, () => (() => Math.floor(Math.random() * 10e5))()).join('-')}`;

class AnimatorAccessError extends Error {
	constructor(message = 'Unauthorized animator assignment') {
		super(message);

		this.name = 'AnimatorAccessError';
	}
}

class InvalidUpdateCallbackError extends Error {
	constructor(receivedValue) {
		super(`Invalid update callback provided. Expected a function but received: ${typeof receivedValue}`);

		this.name = 'InvalidUpdateCallbackError';
	}
}

class InvalidDrawCallbackError extends Error {
	constructor(receivedValue) {
		super(`Invalid draw callback provided. Expected a function but received: ${typeof receivedValue}`);

		this.name = 'InvalidDrawCallbackError';
	}
}

class CommonCanvasAnimator {
	constructor () {
		this.isPlaying = false;
		this.nextFrame = null;
	}

	pause () {
		this.isPlaying = false;

		if (this.nextFrame) window.cancelAnimationFrame(this.nextFrame);
	}

	play () {
		if (this.isPlaying) return;

		this.isPlaying = true;

		this.animate();
	}

	animate () {
		this.update();
		this.draw();

		this.nextFrame = window.requestAnimationFrame(this.animate.bind(this));
	}

	update () {}
	draw () {}
}

class GlobalCommonCanvasAnimator extends CommonCanvasAnimator {
	constructor () {
		super();

		this.canvases = [];

		this.play();
	}

	update () {
		this.canvases.forEach(canvas => {
			if (canvas.isPlaying && typeof canvas.updateCallback === 'function') canvas.updateCallback();
		});
	}

	draw () {
		this.canvases.forEach(canvas => {
			if (canvas.isPlaying && typeof canvas.drawCallback === 'function') canvas.drawCallback(canvas.ctx);
		});
	}
}

class LocalCommonCanvasAnimator extends CommonCanvasAnimator {
	constructor (canvas) {
		super();

		this.canvas = canvas;
	}

	update () {
		if (typeof this.canvas.updateCallback === 'function') this.canvas.updateCallback();
	}

	draw () {
		if (typeof this.canvas.drawCallback === 'function') this.canvas.drawCallback(canvas.ctx);
	}
}

class CommonCanvas {
	#animator;

	constructor (canvas, parent) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.parent = parent;
		this.width = 0;
		this.height = 0;
		this.isVisible = true;
		this.isPlaying = false;
		this.updateCallback = null;
		this.drawCallback = null;

		this.#animator = null;
	}

	setAnimator (animator, key) {
		if (secretKey !== key) throw new AnimatorAccessError('CommonCanvas.setAnimator(): Access denied. Animator can only be assigned internally.');

		this.#animator = animator;
	}

	resize () {
		this.width = this.parent.offsetWidth;
		this.height = this.parent.offsetHeight;

		this.canvas.width = this.width;
		this.canvas.height = this.height;

		if (this.isPlaying && typeof this.drawCallback === 'function') this.drawCallback(this.ctx);
	}

	pause () {
		if (!this.#animator) return;

		this.isPlaying = false;

		if (this.#animator instanceof LocalCommonCanvasAnimator) this.#animator.pause();
	}

	play () {
		if (!this.#animator) return;

		this.isPlaying = true;

		if (this.#animator instanceof LocalCommonCanvasAnimator) this.#animator.play();
	}
}

let showCommonWarnings = true;
let useIntersectionObserver = true;
let useLocalAnimators = false;
let autoPlay = true;

let globalAnimator = null;
const canvasPool = new Map();

const resizeObserver = new ResizeObserver(entries => {
	entries.forEach(entry => {
		const canvas = canvasPool.get(entry.target);

		if (canvas) canvas.resize();
	});
});

const intersectionObserver = new IntersectionObserver((entries, _) => {
	entries.forEach(entry => {
		const canvas = canvasPool.get(entry.target);

		if (canvas) canvas.isVisible = entry.isIntersecting;
	});
}, {
	rootMargin: '0px',
	threshold: 1.0
});

function setControllerProperty (propertyName, value) {
	if (typeof value !== 'boolean') {
		console.warn('Invalid input: setToggleProperty(status) expects a Boolean. Received:', value);
		return;
	}

	if (propertyName === 'commonWarnings') {
		showCommonWarnings = value;
		return;
	}

	if (propertyName === 'intersectionObserver') {
		useIntersectionObserver = value;
		return;
	}

	if (propertyName === 'localAnimators') {
		useLocalAnimators = value;
		return;
	}

	if (propertyName === 'autoPlay') autoPlay = value;
}

function createCanvas ({
	parent = document.body,
	update = null,
	draw = null
} = {}) {
	if (showCommonWarnings && canvasPool.has(parent)) console.warn('Multiple canvases detected for the same parent element. This may lead to visibility issues or rendering conflicts. Recommendation: Use unique parent elements or manage canvas visibility manually.');

	if (!(parent instanceof HTMLElement)) {
		if (showCommonWarnings) console.warn('Invalid parent provided. Defaulting to document.body. Received:', parent);

		parent = document.body;
	}

	if (useIntersectionObserver) intersectionObserver.observe(parent);

	resizeObserver.observe(parent);

	const canvasDOM = document.createElement('canvas');
	const canvas = new CommonCanvas(canvasDOM, parent);

	canvasDOM.classList.add('animation-canvas');
	canvasPool.set(parent, canvas);
	parent.appendChild(canvasDOM);

	if (useLocalAnimators) {
		canvas.setAnimator(new LocalCommonCanvasAnimator(canvas), secretKey);

		if (autoPlay) canvas.play();
	} else {
		if (!globalAnimator) globalAnimator = new GlobalCommonCanvasAnimator();

		canvas.setAnimator(globalAnimator, secretKey);
		globalAnimator.canvases.push(canvas);

		if (autoPlay) canvas.play();
	}

	if (update !== null && typeof update !== 'function') throw new InvalidUpdateCallbackError(update);
	if (draw !== null && typeof draw !== 'function') throw new InvalidDrawCallbackError(draw);

	canvas.updateCallback = update;
	canvas.drawCallback = draw;

	return canvas;
}

export {
	setControllerProperty,
	createCanvas
};
