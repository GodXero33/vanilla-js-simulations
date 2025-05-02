export default class DoublePendulum {
	constructor (length1, length2) {
		this.length1 = length1;
		this.length2 = length2;
		this.angleV1 = 0;
		this.angleV2 = 0;
		this.angle1 = Math.PI / 2;
		this.angle2 = Math.PI / 2;
		this.pinPoint = [0, 0];
		this.bob1 = [0, this.length1];
		this.bob2 = [0, this.length2];
		this.gravity = 1;
		this.frictionFact1 = 0.005;
		this.frictionFact2 = 0.005;
		this.mass1 = 10;
		this.mass2 = 10;
		this.history1 = [];
		this.history2 = [];
		this.historyLength = 50;
		this.drawHistory = false;
		this.lastEnergy1 = 0;
		this.lastEnergy2 = 0;
	}

	update () {
		const angleA1 = (-this.gravity * (2 * this.mass1 + this.mass2) * Math.sin(this.angle1) - this.mass2 * this.gravity * Math.sin(this.angle1 - 2 * this.angle2) - 2 * Math.sin(this.angle1 - this.angle2) * this.mass2 * (this.angleV2 * this.angleV2 * this.length2 + this.angleV1 * this.angleV1 * this.length1 * Math.cos(this.angle1 - this.angle2))) / (this.length1 * (2 * this.mass1 + this.mass2 - this.mass2 * (2 * this.angle1 - 2 * this.angle2)));

		this.angleV1 += angleA1;
		this.angle1 += this.angleV1;
		this.angleV1 *= 1 - this.frictionFact1;

		const angleA2 = 2 * Math.sin(this.angle1 - this.angle2) * (this.angleV1 * this.angleV1 * this.length1 * (this.mass1 + this.mass2) + this.gravity * (this.mass1 + this.mass2) * Math.cos(this.angle1) + this.angleV2 * this.angleV2 * this.length2 * this.mass2 * Math.cos(this.angle1  - this.angle2)) / (this.length2 * (2 * this.mass1 + this.mass2 - this.mass2 * (2 * this.angle1 - 2 * this.angle2)));

		this.angleV2 += angleA2;
		this.angle2 += this.angleV2;
		this.angleV2 *= 1 - this.frictionFact2;

		this.bob1[0] = Math.sin(this.angle1) * this.length1 + this.pinPoint[0];
		this.bob1[1] = Math.cos(this.angle1) * this.length1 + this.pinPoint[1];

		this.bob2[0] = Math.sin(this.angle2) * this.length2 + this.bob1[0];
		this.bob2[1] = Math.cos(this.angle2) * this.length2 + this.bob1[1];

		this.history1.push(...this.bob1);
		this.history2.push(...this.bob2);

		if (this.history1.length > this.historyLength * 2) {
			this.history1.shift();
			this.history1.shift();
		}

		if (this.history2.length > this.historyLength * 2) {
			this.history2.shift();
			this.history2.shift();
		}
	}

	drawPath (ctx) {
		ctx.strokeStyle = '#ffff00';
		ctx.lineCap = 'round';
		ctx.lineWidth = 5;

		ctx.beginPath();

		ctx.moveTo(this.history1[0], this.history1[1]);
		ctx.lineTo(this.history1[0], this.history1[1]);

		for (let a = 2; a < this.history1.length; a += 2) {
			ctx.moveTo(this.history1[a], this.history1[a + 1]);
			ctx.lineTo(this.history1[a], this.history1[a + 1]);
		}

		ctx.stroke();

		ctx.strokeStyle = '#00ffff';

		ctx.beginPath();

		ctx.moveTo(this.history2[0], this.history2[1]);
		ctx.lineTo(this.history2[0], this.history2[1]);

		for (let a = 2; a < this.history2.length; a += 2) {
			ctx.moveTo(this.history2[a], this.history2[a + 1]);
			ctx.lineTo(this.history2[a], this.history2[a + 1]);
		}

		ctx.stroke();
	}

	draw (ctx) {
		if (this.drawHistory && this.history1.length > 3 && this.history2.length > 3) this.drawPath(ctx);

		ctx.fillStyle = '#ffffff';
		ctx.strokeStyle = '#787890';
		ctx.lineWidth = 2;

		ctx.beginPath();
		ctx.moveTo(this.pinPoint[0], this.pinPoint[1]);
		ctx.lineTo(this.bob1[0], this.bob1[1]);
		ctx.lineTo(this.bob2[0], this.bob2[1]);
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(this.pinPoint[0], this.pinPoint[1], 10, 0, Math.PI * 2, false);
		ctx.fill();

		ctx.beginPath();
		ctx.arc(this.bob1[0], this.bob1[1], 10 * Math.sqrt(this.mass1), 0, Math.PI * 2, false);
		ctx.fill();

		ctx.beginPath();
		ctx.arc(this.bob2[0], this.bob2[1], 10 * Math.sqrt(this.mass2), 0, Math.PI * 2, false);
		ctx.fill();
	}

	reset () {
		this.angle1 = Math.PI / 2;
		this.angle2 = Math.PI / 2;
		this.angleV1 = 0;
		this.angleV2 = 0;

		this.update();
	}

	getEnergies () {
		const m1 = this.mass1;
		const g = this.gravity;
		const L1 = this.length1;
		const theta1 = this.angle1;
		const omega1 = this.angleV1;

		const h1 = L1 * (1 - Math.sin(theta1));

		const potential1 = m1 * g * h1;
		const velocity1 = omega1 * L1;
		const kinetic1 = 0.5 * m1 * velocity1 * velocity1;
		const total1 = potential1 + kinetic1;
		const lost1 = this.lastEnergy1 - total1;

		this.lastEnergy1 = total1;

		const m2 = this.mass2;
		const L2 = this.length2;
		const theta2 = this.angle2;
		const omega2 = this.angleV2;

		const h2 = L2 * (1 - Math.sin(theta2));

		const potential2 = m2 * g * h2;
		const velocity2 = omega2 * L2;
		const kinetic2 = 0.5 * m2 * velocity2 * velocity2;
		const total2 = potential2 + kinetic2;
		const lost2 = this.lastEnergy2 - total2;

		this.lastEnergy1 = total1;

		return { potential: potential1 + potential2, kinetic: kinetic1 + kinetic2, total: total1 + total2, lost: lost1 + lost2 };
	}
}
