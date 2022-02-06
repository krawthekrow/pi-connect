import Util from '../Util.js';

export class TileData {
	constructor(jsonData) {
		// legacy
		if (typeof jsonData == 'string') {
			this.text = jsonData;
			return;
		}
		if ('text' in jsonData)
			this.text = jsonData.text;
		if ('audio' in jsonData)
			this.audio = jsonData.audio;
		if ('image' in jsonData)
			this.image = jsonData.image;
	}
};

export class ConnectionsData {
	constructor(isSequence, jsonData) {
		this.isSequence = isSequence;
		this.solution = jsonData.solution;
		this.data = jsonData.data.map((innerJson) =>
			new TileData(innerJson));
	}
};

export class WallData {
	constructor(jsonData) {
		this.groups = jsonData.groups;
		for (const group of this.groups) {
			group.data = group.data.map((innerJson) =>
				new TileData(innerJson));
		}
		this.perm = ('perm' in jsonData) ?
			jsonData.perm : Util.GetRandomPermutation(16);
	}
};

export class VowelsData {
	constructor(jsonData) {
		const makeClue = (word) => {
			let transformed = '';
			for (let i = 0; i < word.length; i++) {
				if ('aeiouy'.includes(word[i].toLowerCase()))
					continue;
				if (!/^[a-zA-Z]$/g.test(word[i]))
					continue;
				if (i != 0 && Math.floor(Math.random() * 3) == 0)
					transformed += ' ';
				transformed += word[i];
			}
			return transformed.toUpperCase();
		};
		this.desc = jsonData.desc;
		this.data = jsonData.data.map((data) => {
			if (typeof data === 'string') {
				// Legacy vowels data format
				return {
					clue: makeClue(data),
					solution: data
				};
			}
			if (!('clue' in data)) {
				return {
					clue: makeClue(data.solution),
					solution: data.solution
				};
			}
			return data;
		});
	}
};

export default class GameData {
	constructor(jsonData) {
		this.connections = jsonData.connections.map((innerJson) =>
			new ConnectionsData(false, innerJson));
		this.sequences = jsonData.sequences.map((innerJson) =>
			new ConnectionsData(true, innerJson));
		this.walls = jsonData.walls.map((innerJson) =>
			new WallData(innerJson));
		this.vowels = jsonData.vowels.map((innerJson) =>
			new VowelsData(innerJson));
		Util.Shuffle(this.connections);
		Util.Shuffle(this.sequences);
		Util.Shuffle(this.walls);
	}
}
