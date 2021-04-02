import update from 'immutability-helper';

class TimerUI {
	constructor(maxTime) {
		this.text = null;
		this.start = null;
		this.stop = null;
		this.currTime = new Date().getTime();
		this.maxTime = maxTime;

		// this is necessary to convince Chrome to re-render progress bars
		this.progressRenderCounter = 0;
		this.progressVal = this.recalcProgressVal();
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
	recalcProgressVal() {
		return this.getTimeUsed() / this.maxTime * 100;
	}
	getResetProgressRenderCounter() {
		return update(this, {
			progressRenderCounter: { $set: 0 },
			progressVal: { $set: this.recalcProgressVal() }
		});
	}
	getUpdateCurrTime() {
		const currTimeUpdated = update(this, {
			currTime: { $set: new Date().getTime() },
			progressRenderCounter: { $set: this.progressRenderCounter + 1 }
		});
		if (currTimeUpdated.progressRenderCounter == 2)
			return currTimeUpdated.getResetProgressRenderCounter();
		else
			return currTimeUpdated;
	}
	getStart() {
		const timeUsed = this.getTimeUsed();
		if (timeUsed == null) {
			console.error('Time used null.');
			return this;
		}
		const newStart = new Date().getTime() - timeUsed;
		return update(this, {
			text: { $set: null },
			stop: { $set: null },
			start: { $set: newStart }
		}).getResetProgressRenderCounter();
	}
	getStop() {
		return update(this, {
			stop: { $set: new Date().getTime() }
		}).getResetProgressRenderCounter();
	}
	getChange(newVal) {
		return update(this, {
			text: { $set: newVal }
		}).getResetProgressRenderCounter();
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
