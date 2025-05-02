export default class Pendulum {
	constructor (length) {
		this.length = length;
		this.angleV = 0;
		this.angle = 0;
		this.pinPoint = [0, 0];
		this.bob = [0, this.length];
		this.gravity = 2;
		this.frictionFact = 0.005;
		this.mass = 1;
		this.history = [];
		this.historyLength = 50;
		this.drawHistory = false;
		this.lastEnergy = 0;
	}

	update () {
		const angleA = Math.cos(this.angle) * this.gravity / this.length;

		this.angleV += angleA;
		this.angle += this.angleV;
		this.angleV *= 1 - this.frictionFact;

		this.bob[0] = Math.cos(this.angle) * this.length + this.pinPoint[0];
		this.bob[1] = Math.sin(this.angle) * this.length + this.pinPoint[1];

		this.history.push(...this.bob);

		if (this.history.length > this.historyLength * 2) {
			this.history.shift();
			this.history.shift();
		}
	}

	drawPath (ctx) {
		ctx.strokeStyle = '#ffff00';
		ctx.lineCap = 'round';
		ctx.lineWidth = 5;

		ctx.beginPath();

		ctx.moveTo(this.history[0], this.history[1]);
		ctx.lineTo(this.history[0], this.history[1]);

		for (let a = 2; a < this.history.length; a += 2) {
			ctx.moveTo(this.history[a], this.history[a + 1]);
			ctx.lineTo(this.history[a], this.history[a + 1]);
		}

		ctx.stroke();
	}

	draw (ctx) {
		if (this.drawHistory && this.history.length > 3) this.drawPath(ctx);

		ctx.fillStyle = '#ffffff';
		ctx.strokeStyle = '#787890';
		ctx.lineWidth = 2;

		ctx.beginPath();
		ctx.moveTo(this.pinPoint[0], this.pinPoint[1]);
		ctx.lineTo(this.bob[0], this.bob[1]);
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(this.pinPoint[0], this.pinPoint[1], 10, 0, Math.PI * 2, false);
		ctx.fill();

		ctx.beginPath();
		ctx.arc(this.bob[0], this.bob[1], 30, 0, Math.PI * 2, false);
		ctx.fill();
	}

	reset () {
		this.angle = 0;
		this.angleV = 0;

		this.update();
	}

	getEnergies () {
		const m = this.mass;
		const g = this.gravity;
		const L = this.length;
		const theta = this.angle;
		const omega = this.angleV;

		const h = L * (1 - Math.sin(theta));

		const potential = m * g * h;
		const velocity = omega * L;
		const kinetic = 0.5 * m * velocity * velocity;
		const total = potential + kinetic;
		const lost = this.lastEnergy - total;

		this.lastEnergy = total;

		return { potential, kinetic, total, lost };
	}
}
