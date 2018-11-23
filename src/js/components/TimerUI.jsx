class TimerUI {
	constructor(maxTime) {
		this.text = null;
		this.start = null;
		this.stop = null;
		this.currTime = new Date().getTime();
		this.maxTime = maxTime;
	}
	isStarted() {
		return this.start != null;
	}
	isStopped() {
		return this.stop != null;
	}
	isDirty() {
		return this.text != null;
	}
	isValid() {
		return !this.isDirty() || (this.parseText() != null);
	}
	isRunning() {
		return this.isStarted() && !this.isStopped() && !this.isDirty();
	}
	parseText() {
		return TimerUI.ParseText(this.text);
	}
	getTimeUsed() {
		if (!this.isDirty()) {
			if (!this.start)
				return 0;
			if (this.stop)
				return this.stop - this.start;
			return new Date().getTime() - this.start;
		}
		const val = this.parseText();
		if (val == null)
			return null;
		return this.maxTime - val * 1000;
	}
	getTimeLeft() {
		const timeUsed = this.getTimeUsed();
		if (timeUsed == null)
			return null;
		return this.maxTime - this.getTimeUsed();
	}
	isExpired() {
		return this.getTimeLeft() <= 0;
	}
	getText() {
		if (this.isDirty())
			return this.text;
		let timeLeft = this.getTimeLeft();
		if (timeLeft == null || timeLeft < 0)
			timeLeft = 0;
		const timeLeftSeconds = Math.trunc(timeLeft / 1000);
		const timeLeftMinutes = Math.trunc(timeLeftSeconds / 60);
		const timeLeftSecondsText = (timeLeftSeconds % 60).toString();
		const timeLeftSecondsPadded = timeLeftSecondsText.padStart(2, '0');
		return `${timeLeftMinutes}:${timeLeftSecondsPadded}`;
	}
};
TimerUI.ParseText = (val) => {
	const match = /^([0-9])\:([0-9]+)$/g.exec(val);
	if (match == null)
		return null;
	const minutes = parseInt(match[1]);
	const seconds = parseInt(match[2]);
	if (seconds >= 60)
		return null;
	const timeLeft = minutes * 60 + seconds;
	return timeLeft;
};

export default TimerUI;
