function makeSampleGame() {
	const res = {
		connections: [],
		sequences: [],
		walls: [],
		vowels: []
	};
	for (let i = 0; i < 6; i++) {
		res.connections.push({
			solution: 'sample',
			data: []
		});
		res.sequences.push({
			solution: 'sample',
			data: []
		});
		for(let j = 0; j < 4; j++) {
			res.connections[i].data.push({
				text: 'sample'
			});
			res.sequences[i].data.push({
				text: 'sample'
			});
		}
	}
	for (let i = 0; i < 2; i++) {
		res.walls.push({
			groups: []
		});
		for (let j = 0; j < 4; j++) {
			res.walls[i].groups.push({
				solution: 'sample',
				data: []
			});
			for (let k = 0; k < 4; k++) {
				res.walls[i].groups[j].data.push('sample');
			}
		}
	}
	for (let i = 0; i < 4; i++) {
		res.vowels.push({
			desc: 'sample',
			data: []
		});
		for (let j = 0; j < 4; j++) {
			res.vowels[i].data.push('sample');
		}
	}
	return res;
}

export default makeSampleGame();
