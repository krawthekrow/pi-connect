function makeSampleGame() {
	const res = {
		connections: [],
		sequences: [],
		walls: [],
		vowels: []
	};
	for (let i = 0; i < 6; i++) {
		res.connections.push({
			solution: 'solution',
			data: []
		});
		res.sequences.push({
			solution: 'solution',
			data: []
		});
		for(let j = 0; j < 4; j++) {
			res.connections[i].data.push({
				text: 'clue'
			});
			res.sequences[i].data.push({
				text: 'clue'
			});
		}
	}
	for (let i = 0; i < 2; i++) {
		res.walls.push({
			groups: []
		});
		for (let j = 0; j < 4; j++) {
			res.walls[i].groups.push({
				solution: 'solution',
				data: []
			});
			for (let k = 0; k < 4; k++) {
				res.walls[i].groups[j].data.push(`item ${j+1}`);
			}
		}
	}
	for (let i = 0; i < 4; i++) {
		res.vowels.push({
			desc: 'category',
			data: []
		});
		for (let j = 0; j < 4; j++) {
			res.vowels[i].data.push('solution');
		}
	}
	return res;
}

export default makeSampleGame();
