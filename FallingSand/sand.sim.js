export default class SandSim {
	static colors = ['#000000', '#FF6B6B', '#6BCB77', '#4D96FF', '#FFC300', '#9D4EDD', '#00C2A8', '#FF8C42', '#D72638', '#6E44FF', '#F4A261'];

	constructor () {
		this.cellSize = 20;
		this.cols = 0;
		this.rows = 0;
		this.grid = null;
		this.colorIndex = 1;

		this.makeColorPicker();
	}

	resize (w, h, ctx) {
		this.cols = Math.floor(w / this.cellSize) + 1;
		this.rows = Math.floor(h / this.cellSize) + 1;

		this.grid = Array.from({ length: this.rows }, () => Array.from({ length: this.cols }, () => 0));

		this.draw(ctx);
	}

	draw (ctx) {
		if (!this.grid) return;

		this.grid.forEach((row, y) => {
			row.forEach((cell, x) => {
				ctx.fillStyle = SandSim.colors[cell];
				ctx.beginPath();
				ctx.rect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
				ctx.fill();
			});
		});
	}

	update () {
		if (!this.grid) return;

		const nextGrid = Array.from({ length: this.rows }, () => Array.from({ length: this.cols }, () => 0));
		this.grid.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (cell !== 0) {
					const nextRow = this.grid[y + 1];

					if (nextRow) {
						const dir = Math.random() > 0.5 ? 1 : -1;
						const below = nextRow[x];
						const belowA = nextRow[x - dir];
						const belowB = nextRow[x + dir];

						if (below === 0) {
							nextGrid[y + 1][x] = cell;
						} else if (belowA === 0) {
							nextGrid[y + 1][x - dir] = cell;
						} else if (belowB === 0) {
							nextGrid[y + 1][x + dir] = cell;
						} else {
							nextGrid[y][x] = cell;
						}
					} else {
						nextGrid[y][x] = cell;
					}
				}
			});
		});

		this.grid = nextGrid;
	}

	addSand (x, y) {
		if (x < 0 || y < 0 || x > this.cols || y > this.rows) return;
		if (this.grid[y][x] !== 0) return;

		this.grid[y][x] = this.colorIndex;
	}

	setCurrentSandColor (colorIndex) {
		this.colorIndex = colorIndex;
	}

	makeColorPicker () {
		const container = document.createElement('div');
		container.style = 'position:fixed;top:10px;left:10px;z-index:1000;background:#fff;padding:10px;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.3);font-family:sans-serif;font-size:14px;display:flex;flex-wrap:wrap;gap:10px;';

		SandSim.colors.forEach((color, i) => {
			if (i === 0) return;

			const label = document.createElement('label');

			label.style = 'display:flex;align-items:center;gap:5px;cursor:pointer;';

			const input = document.createElement('input');

			input.type = 'radio';
			input.name = 'sand-color';
			input.value = i;

			if (i === 1) input.checked = true;

			input.addEventListener('change', () => this.setCurrentSandColor(i));

			const swatch = document.createElement('span');

			swatch.style = `display:inline-block;width:20px;height:20px;background:${color};border:1px solid #ccc;border-radius:4px;`;

			label.appendChild(input);
			label.appendChild(swatch);
			label.appendChild(document.createTextNode(` ${i}`));
			container.appendChild(label);
		});

		document.body.appendChild(container);
		this.setCurrentSandColor(1);
	}
}
