class Util {
	static Shuffle(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
	}
	static GetRandomPermutation(len) {
		const arr = [];
		for (let i = 0; i < len; i++)
			arr.push(i);
		Util.Shuffle(arr);
		return arr;
	}
};

export default Util;
