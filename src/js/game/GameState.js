import update from 'immutability-helper';
import TimerUI from './TimerUI.jsx';
import Mechanics from '../game/Mechanics.js';
import SAMPLE_GAME from '../game/SampleGame.js';

const CONNECTIONS_TIMEOUT = 40 * 1000;
const WALL_TIMEOUT = 2.5 * 60 * 1000;
const WALL_WRONG_GUESS_TIMEOUT = 0.5 * 1000;
const VOWELS_TIMEOUT = 90 * 1000;

class GameState {
	constructor(game) {
		this.game = game,
		this.teams = [{
			name: 'Enter Team Name',
			score: '0'
		}, {
			name: 'Enter Team Name',
			score: '0'
		}];
		this.timer = new TimerUI(0);
		this.turn = 0;
		this.stage = GameState.STAGE_CONNECTIONS;
		this.substage = GameState.SUBSTAGE_CHOOSE;
		this.puzzleIndex = 0;
		this.clueIndex = 0;
		this.isRevealed = false;
		this.wall = {
			numStrikes: 0,
			selected: [],
			found: [],
			wallPoints: 0,
			wrongGuessPenalty: null
		};
		this.chosen = [];
	}
	getChangeTeamName(teamId, newVal) {
		return update(this, {
			teams: { [teamId]: { name: { $set: newVal } } }
		});
	}
	getChangeScore(teamId, newVal) {
		return update(this, {
			teams: { [teamId]: { score: { $set: newVal } } }
		});
	}
	getIncScore(teamId, inc) {
		const score = (parseInt(this.teams[teamId].score) + inc).toString();
		return this.getChangeScore(teamId, score);
	}
	getResetTimer() {
		const timeout =
			this.isConnectionsTypeStage() ? CONNECTIONS_TIMEOUT
			: (this.stage == GameState.STAGE_WALL) ? WALL_TIMEOUT
			: VOWELS_TIMEOUT;
		return update(this, {
			timer: { $set: new TimerUI(timeout) }
		});
	}
	getStartTimer() {
		if (!this.timer.isValid())
			return this;
		const timeUsed = this.timer.getTimeUsed();
		if (timeUsed == null) {
			console.error('Time used null.');
			return this;
		}
		const newStart = new Date().getTime() - timeUsed;
		return update(this, {
			timer: {
				text: { $set: null },
				stop: { $set: null },
				start: { $set: newStart }
			}
		});
	}
	getStopTimer() {
		if (!this.timer.isRunning())
			return this;
		return update(this, {
			timer: { stop: { $set: new Date().getTime() } }
		});
	}
	getChangeTimer(newVal) {
		return update(this, {
			timer: { text: { $set: newVal } }
		});
	}
	getChangeTurn() {
		return update(this, {
			turn: { $set: (this.turn + 1) % 2 }
		});
	}
	getResetMicro(timeout) {
		return update(this, {
			timer: { $set: new TimerUI(timeout) },
			clueIndex: { $set: 0 },
			puzzleIndex: { $set: 0 },
			isRevealed: { $set: false },
			wall: {
				strikes: { $set: 0 },
				selected: { $set: [] },
				found: { $set: [] },
				wallPoints: { $set: 0 },
				wrongGuessPenalty: { $set: null }
			}
		});
	}
	getResetMacro() {
		return update(this.getResetMicro(0), {
			teams: {
				[0]: { score: { $set: '0' } },
				[1]: { score: { $set: '0' } },
			},
			turn: { $set: 0 },
			stage: { $set: GameState.STAGE_CONNECTIONS },
			substage: { $set: GameState.SUBSTAGE_CHOOSE },
			chosen: { $set: [] }
		});
	}
	getNewGame(newVal) {
		return update(this.getResetMacro(), {
			game: { $set: newVal }
		});
	}
	isConnectionsTypeStage() {
		return this.stage == GameState.STAGE_CONNECTIONS ||
			this.stage == GameState.STAGE_SEQUENCES;
	}
	isNextEnabled() {
		if (this.substage == GameState.SUBSTAGE_CHOOSE)
			return true;
		if (this.stage == GameState.STAGE_VOWELS)
			return (this.puzzleIndex < this.game.vowels.length - 1) ||
				(this.clueIndex < 3);
		if (this.stage == GameState.STAGE_SEQUENCES)
			return this.clueIndex < 2;
		return this.clueIndex < 3;
	}
	isPrevEnabled() {
		if (this.substage == GameState.SUBSTAGE_CHOOSE)
			return this.stage != GameState.STAGE_CONNECTIONS;
		if (this.stage == GameState.STAGE_WALL &&
				this.substage == GameState.STAGE_MAIN)
			return false;
		if (this.stage == GameState.STAGE_VOWELS)
			return !(this.substage == GameState.SUBSTAGE_VOWELS_CATEGORY &&
				this.puzzleIndex == 0);
		return this.clueIndex != 0;
	}
	isBackEnabled() {
		return this.substage != GameState.SUBSTAGE_CHOOSE;
	}
	isRevealEnabled() {
		return this.substage != GameState.SUBSTAGE_CHOOSE &&
			this.substage != GameState.SUBSTAGE_CATEGORY;
	}
	isCorrectWrongEnabled() {
		if (this.isRevealed)
			return false;
		if (this.isConnectionsTypeStage())
			return this.substage == GameState.SUBSTAGE_MAIN ||
				this.substage == GameState.SUBSTAGE_SECONDARY;
		if (this.stage == GameState.STAGE_WALL)
			return this.wall.found.length == 4;
		if (this.stage == GameState.STAGE_VOWELS)
			return this.substage == GameState.SUBSTAGE_BUZZED ||
				this.substage == GameState.SUBSTAGE_SECONDARY;
		console.error(`unrecognized stage ${this.stage}`);
		return false;
	}
	isLeftRightEnabled() {
		return this.stage == GameState.STAGE_VOWELS &&
			this.substage == GameState.SUBSTAGE_MAIN &&
			!this.isRevealed;
	}
	getEnterStage(stage) {
		if (stage == GameState.STAGE_VOWELS)
			return update(this, {
				stage: { $set: stage }
			}).getStartRound(0);
		return update(this.getResetMicro(0), {
			stage: { $set: stage },
			substage: { $set: GameState.SUBSTAGE_CHOOSE },
			chosen: { $set: [] }
		});
	}
	getStartRound(puzzleIndex) {
		const substage = (this.stage == GameState.STAGE_VOWELS) ?
			GameState.SUBSTAGE_CATEGORY : GameState.SUBSTAGE_MAIN;
		const chosen = this.chosen.slice(0);
		if (!this.chosen.includes(puzzleIndex))
			chosen.push(puzzleIndex);
		const timeout =
			(this.stage == GameState.STAGE_VOWELS) ? VOWELS_TIMEOUT
			: (this.stage == GameState.STAGE_WALL) ? WALL_TIMEOUT
			: CONNECTIONS_TIMEOUT;
		return update(this.getResetMicro(timeout).getStartTimer(), {
			substage: { $set: substage },
			puzzleIndex: { $set: puzzleIndex },
			chosen: { $set: chosen }
		});
	}
	static GetCompleteFound(prevFound) {
		const found = prevFound.slice(0);
		for (let i = 0; i < 4; i++) {
			if (!found.includes(i))
				found.push(i);
		}
		return found;
	}
	getNext() {
		if (!this.isNextEnabled())
			return this;
		if (this.substage == GameState.SUBSTAGE_CHOOSE) {
			const stage =
				(this.stage == GameState.STAGE_CONNECTIONS) ?
					GameState.STAGE_SEQUENCES
				: (this.stage == GameState.STAGE_SEQUENCES) ?
					GameState.STAGE_WALL
				: (this.stage == GameState.STAGE_WALL) ?
					GameState.STAGE_VOWELS
				: stage;
			return (stage == GameState.STAGE_WALL ?
				this.getChangeTurn() : this).getEnterStage(stage);
		}
		if (this.stage == GameState.STAGE_VOWELS) {
			if (this.substage == GameState.SUBSTAGE_CATEGORY)
				return update(this, {
					substage: { $set: GameState.SUBSTAGE_MAIN }
				});
			if (this.clueIndex == 3)
				return update(this, {
					substage: { $set: GameState.SUBSTAGE_CATEGORY },
					isRevealed: { $set: false },
					puzzleIndex: { $set: this.puzzleIndex + 1 },
					clueIndex: { $set: 0 },
				});
			return update(this, {
				substage: { $set: GameState.SUBSTAGE_MAIN },
				isRevealed: { $set: false },
				clueIndex: { $set: this.clueIndex + 1 }
			});
		}
		if (this.stage == GameState.STAGE_WALL &&
				this.wall.found.length != 4)
			return this.getReveal();
		return update(this, {
			isRevealed: { $set: false },
			clueIndex: { $set: this.clueIndex + 1 }
		});
	}
	getPrev() {
		if (!this.isPrevEnabled())
			return this;
		if (this.substage == GameState.SUBSTAGE_CHOOSE) {
			const stage =
				(this.stage == GameState.STAGE_SEQUENCES) ?
					GameState.STAGE_CONNECTIONS
				: (this.stage == GameState.STAGE_WALL) ?
					GameState.STAGE_SEQUENCES
				: stage;
			return this.getEnterStage(stage);
		}
		if (this.stage == GameState.STAGE_VOWELS) {
			if (this.substage == GameState.SUBSTAGE_CATEGORY) {
				if (this.puzzleIndex == 0)
					return this.getEnterStage(GameState.STAGE_WALL);
				return update(this, {
					substage: { $set: GameState.SUBSTAGE_MAIN },
					puzzleIndex: { $set: this.puzzleIndex - 1 },
					clueIndex: { $set: 3 }
				});
			}
			if (this.clueIndex == 0)
				return update(this, {
					substage: { $set: GameState.SUBSTAGE_CATEGORY },
					isRevealed: { $set: false }
				});
		}
		return update(this, {
			clueIndex: { $set: this.clueIndex - 1 },
			isRevealed: { $set: false }
		});
	}
	getBack() {
		if (!this.isBackEnabled())
			return this;
		if (this.stage == GameState.STAGE_VOWELS)
			return this.getEnterStage(GameState.STAGE_WALL);
		const changeTurn = this.stage == GameState.STAGE_WALL;
		return update(
			(changeTurn ? this.getChangeTurn() : this).getResetMicro(0), {
			substage: { $set: GameState.SUBSTAGE_CHOOSE }
		});
	}
	getReveal() {
		if (!this.isRevealEnabled())
			return this;
		if (this.stage == GameState.STAGE_WALL &&
				this.wall.found.length != 4)
			return update(this.getStopTimer(), {
				wall: {
					found: {
						$set: GameState.GetCompleteFound(this.wall.found)
					},
					selected: { $set: [] }
				}
			});
		return update(this, {
			isRevealed: { $set: !this.isRevealed }
		});
	}
	getCorrect() {
		if (!this.isCorrectWrongEnabled())
			return this;
		if (this.isConnectionsTypeStage()) {
			const changeTurn = this.substage == GameState.SUBSTAGE_MAIN;
			return update(
				(changeTurn ? this.getChangeTurn() : this)
				.getStopTimer()
				.getIncScore(this.turn,
					Mechanics.IndexToPoints(this.clueIndex)), {
				clueIndex: { $set: 3 },
				isRevealed: { $set: true }
			});
		}
		if (this.stage == GameState.STAGE_WALL) {
			return update(this.getIncScore(this.turn,
					(this.wall.wallPoints == 7) ? 3 : 1), {
				isRevealed: { $set: true },
				wall: {
					wallPoints: { $set: this.wall.wallPoints + 1 }
				}
			});
		}
		if (this.stage == GameState.STAGE_VOWELS)
			return update(this.getIncScore(this.turn, 1), {
				isRevealed: { $set: true }
			});
		console.error(`unrecognized stage ${this.stage}`);
		return this;
	}
	getWrong() {
		if (!this.isCorrectWrongEnabled())
			return this;
		if (this.isConnectionsTypeStage()) {
			if (this.substage == GameState.SUBSTAGE_MAIN)
				return update(this.getChangeTurn().getStopTimer(), {
					substage: { $set: GameState.SUBSTAGE_SECONDARY },
					clueIndex: { $set: 3 }
				});
			if (this.substage == GameState.SUBSTAGE_SECONDARY)
				return update(this.getStopTimer(), {
					clueIndex: { $set: 3 },
					isRevealed: { $set: true }
				});
			console.error(`unrecognized substage ${this.substage}`);
		}
		if (this.stage == GameState.STAGE_WALL)
			return update(this, {
				isRevealed: { $set: true }
			});
		if (this.stage == GameState.STAGE_VOWELS) {
			if (this.substage == GameState.SUBSTAGE_BUZZED)
				return update(
					this.getIncScore(this.turn, -1).getChangeTurn(), {
					substage: { $set: GameState.SUBSTAGE_SECONDARY }
				});
			if (this.substage == GameState.SUBSTAGE_SECONDARY)
				return update(this, {
					isRevealed: { $set: true }
				});
			console.error(`unrecognized substage ${this.substage}`);
		}
		console.error(`unrecognized stage ${this.stage}`);
	}
	getBuzz(teamId) {
		if (!this.isLeftRightEnabled())
			return this;
		return update(this, {
			turn: { $set: teamId },
			substage: { $set: GameState.SUBSTAGE_BUZZED }
		});
	}
	getChoose(index) {
		return this.getStartRound(index);
	}
	getWallClick(index) {
		if (this.wall.found.includes(Math.trunc(index / 4)))
			return this;
		if (this.wall.wrongGuessPenalty != null)
			return this;
		if (this.wall.strikes == 3)
			return this;
		if (this.timer.isExpired())
			return this;
		const selected = this.wall.selected.slice(0);
		const arrPos = selected.indexOf(index);
		if (arrPos == -1)
			selected.push(index);
		else
			selected.splice(arrPos, 1);
		if (selected.length != 4)
			return update(this, {
				wall: { selected: { $set: selected } }
			});
		const group = Math.trunc(selected[0] / 4);
		const correct = selected.every((val) => (
			Math.trunc(val / 4) == group));
		if (correct) {
			let found = this.wall.found.slice(0);
			found.push(group);
			if (found.length == 3)
				found = GameState.GetCompleteFound(found);
			const inc = found.length - this.wall.found.length;
			const done = found.length == 4;
			return update(
				(done ? this.getStopTimer() : this)
				.getIncScore(this.turn, inc), {
				wall: {
					selected: { $set: [] },
					found: { $set: found },
					wallPoints: { $set: this.wall.wallPoints + inc }
				}
			});
		}
		const strikes = (this.wall.found.length == 2) ?
			(this.wall.strikes + 1) : this.wall.strikes;
		return update(
			(strikes == 3) ? this.getStopTimer() : this, {
			wall: {
				strikes: { $set: strikes },
				selected: { $set: selected },
				wrongGuessPenalty: { $set: new Date().getTime() }
			}
		});
	}
	getUpdateCurrTime() {
		return update(this, {
			timer: { currTime: { $set: new Date().getTime() } }
		});
	}
	getUpdateTimer() {
		if (!(this.timer.isRunning() && this.timer.isExpired()))
			return this;
		return update(this.getStopTimer(), {
			wall: {
				selected: { $set: [] }
			}
		});
	}
	getUpdateWrongGuessPenalty() {
		if (this.wall.wrongGuessPenalty == null)
			return this;
		const timeDiff = new Date().getTime() -
			this.wall.wrongGuessPenalty;
		if (timeDiff < WALL_WRONG_GUESS_TIMEOUT)
			return this;
		return update(this, {
			wall: {
				selected: { $set: [] },
				wrongGuessPenalty: { $set: null }
			}
		});
	}
};
GameState.STAGE_CONNECTIONS = 0;
GameState.STAGE_SEQUENCES = 1;
GameState.STAGE_WALL = 2;
GameState.STAGE_VOWELS = 3;
GameState.SUBSTAGE_MAIN = 0;
GameState.SUBSTAGE_SECONDARY = 1;
GameState.SUBSTAGE_BUZZED = 2;
GameState.SUBSTAGE_CATEGORY = 3;
GameState.SUBSTAGE_CHOOSE = 4;

export default GameState;
