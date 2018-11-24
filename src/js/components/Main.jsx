import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import TeamCard from './TeamCard.jsx';
import TimerUI from './TimerUI.jsx';
import ConnectionsPanel from './Connections.jsx';
import ChoosePanel from './Choose.jsx';
import WallPanel from './Wall.jsx';
import VowelsPanel from './Vowels.jsx';
import GameData from '../game/GameData.js';
import Mechanics from '../game/Mechanics.js';
import SAMPLE_GAME from '../game/SampleGame.js';

const CONNECTIONS_TIMEOUT = 40 * 1000;
const WALL_TIMEOUT = 2.5 * 60 * 1000;
const WALL_WRONG_GUESS_TIMEOUT = 0.5 * 1000;
const VOWELS_TIMEOUT = 90 * 1000;

function parseGame(jsonData) {
	return new GameData(jsonData);
}

class Main extends Component {
	constructor(props) {
		super(props);

		this.state = {
			game: parseGame(SAMPLE_GAME),
			teams: [{
				name: 'Enter Team Name',
				score: '0'
			}, {
				name: 'Enter Team Name',
				score: '0'
			}],
			state: {
				timer: new TimerUI(0),
				turn: 0,
				stage: 'connections',
				substage: 'choose',
				puzzleIndex: 0,
				index: 0,
				isRevealed: false,
				// wall-specific
				strikes: 0,
				selected: [],
				found: [],
				wallPoints: 0,
				wrongGuessPenalty: null,
				// choose-specific
				chosen: []
			},
			showConfig: false
		};

		this.timerInput = React.createRef();

		this.teamNameChangeCallbacks = [];
		this.teamScoreChangeCallbacks = [];
		this.teamScoreIncCallbacks = [];
		for (let i = 0; i < 2; i++) {
			this.teamNameChangeCallbacks.push((newVal) => {
				this.handleTeamNameChange(i, newVal);
			});
			this.teamScoreChangeCallbacks.push((newVal) => {
				this.handleTeamScoreChange(i, newVal);
			});
			this.teamScoreIncCallbacks.push((newVal) => {
				this.handleTeamScoreInc(i, newVal);
			});
		}
		this.onFrame = this.onFrame.bind(this);
		this.handleWallClick = this.handleWallClick.bind(this);
		this.handleChooseClick = this.handleChooseClick.bind(this);
		this.handleTimerChange = this.handleTimerChange.bind(this);
		this.handleTimerStart = this.handleTimerStart.bind(this);
		this.handleTimerStop = this.handleTimerStop.bind(this);
		this.handleTimerReset = this.handleTimerReset.bind(this);
		this.handleNext = this.handleNext.bind(this);
		this.handleBack = this.handleBack.bind(this);
		this.handleCorrect = this.handleCorrect.bind(this);
		this.handleWrong = this.handleWrong.bind(this);
		this.handleLeft = this.handleLeft.bind(this);
		this.handleRight = this.handleRight.bind(this);
		this.handleTurn = this.handleTurn.bind(this);
		this.handleReveal = this.handleReveal.bind(this);
		this.handleExitConfig = this.handleExitConfig.bind(this);
		this.handleEnterConfig = this.handleEnterConfig.bind(this);
		this.handleConfigChange = this.handleConfigChange.bind(this);
	}
	componentDidMount() {
		window.requestAnimationFrame(this.onFrame);
	}
	onFrame() {
		this.setState((state) => update(state, {
			state: { timer: { currTime: { $set: new Date().getTime() } } }
		}));
		this.setState((state) => {
			const timer = state.state.timer;
			if (!(timer.isRunning() && timer.isExpired()))
				return state;
			return update(Main.StopStateTimer(state), {
				state: {
					selected: { $set: [] }
				}
			});
		});
		this.setState((state) => {
			if (state.state.wrongGuessPenalty == null)
				return state;
			const timeDiff = new Date().getTime() -
				state.state.wrongGuessPenalty;
			if (timeDiff < WALL_WRONG_GUESS_TIMEOUT)
				return state;
			return update(state, {
				state: {
					selected: { $set: [] },
					wrongGuessPenalty: { $set: null }
				}
			});
		});
		window.requestAnimationFrame(this.onFrame);
	}
	handleTeamNameChange(teamId, newVal) {
		this.setState((state) => update(state, {
			teams: { [teamId]: { name: { $set: newVal } } }
		}));
	}
	static IncStateScore(state, teamId, inc) {
		const currScore = parseInt(state.teams[teamId].score);
		if (isNaN(currScore))
			return state;
		const newScore = (currScore + inc).toString();
		return update(state, {
			teams: { [teamId]: { score: { $set: newScore } } }
		});
	}
	static StopStateTimer(state) {
		if (!state.state.timer.isRunning())
			return state;
		return update(state, {
			state: { timer: { stop: { $set: new Date().getTime() } } }
		});
	}
	static ResetStateMicro(state, timeout) {
		return update(state, {
			state: {
				timer: { $set: new TimerUI(timeout) },
				index: { $set: 0 },
				isRevealed: { $set: false },
				// wall-specific
				strikes: { $set: 0 },
				selected: { $set: [] },
				found: { $set: [] },
				wallPoints: { $set: 0 },
				wrongGuessPenalty: { $set: null }
			}
		});
	}
	handleTeamScoreChange(teamId, newVal) {
		this.setState((state) => update(state, {
			teams: { [teamId]: { score: { $set: newVal } } }
		}));
	}
	handleTeamScoreInc(teamId, inc) {
		this.setState((state) =>
			Main.IncStateScore(state, teamId, inc));
	}
	handleWallClick(index) {
		const state = this.state.state;
		if (state.found.includes(Math.trunc(index / 4)))
			return;
		if (state.wrongGuessPenalty != null)
			return;
		if (state.strikes == 3)
			return;
		if (state.timer.isExpired())
			return;
		this.setState((state) => {
			const selected = state.state.selected;
			const arrPos = selected.indexOf(index);
			const newSelected = selected.slice(0);
			if (arrPos == -1)
				newSelected.push(index);
			else
				newSelected.splice(arrPos, 1);
			if (newSelected.length == 4) {
				const group = Math.trunc(newSelected[0] / 4);
				const correct = newSelected.every((val) => (
					Math.trunc(val / 4) == group));
				if (correct) {
					const newFound = state.state.found.slice(0);
					newFound.push(group);
					if (newFound.length == 3) {
						// find remaining group
						let remainder = 0;
						for (let i = 0; i < 4; i++)
							remainder ^= i;
						for (let i = 0; i < 3; i++)
							remainder ^= newFound[i];
						newFound.push(remainder);
					}
					const done = newFound.length == 4;
					const substage = done ?
						'connections' : state.state.substage;
					const inc = newFound.length - state.state.found.length;
					const afterInc = Main.IncStateScore(state,
						state.state.turn, inc);
					return update(
						done ? Main.StopStateTimer(afterInc) : afterInc, {
						state: {
							substage: { $set: substage },
							selected: { $set: [] },
							found: { $set: newFound },
							wallPoints: {
								$set: state.state.wallPoints + inc
							}
						}
					});
				}
				const strikes =
					(state.state.found.length == 2) ?
						(state.state.strikes + 1)
					: state.state.strikes;
				const done = strikes == 3;
				return update(
					done ? Main.StopStateTimer(state) : state, {
					state: {
						strikes: { $set: strikes },
						selected: { $set: newSelected },
						wrongGuessPenalty: { $set: new Date().getTime() }
					}
				});
			}
			return update(state, {
				state: { selected: { $set: newSelected } }
			});
		});
	}
	handleChooseClick(index) {
		this.setState((state) => {
			const newChosen = state.state.chosen.slice(0);
			if (!state.state.chosen.includes(index))
				newChosen.push(index);
			const timeout = state.state.stage == 'wall' ?
				WALL_TIMEOUT : CONNECTIONS_TIMEOUT;
			return update(
				Main.ResetStateMicro(state, timeout), {
				state: {
					timer: {
						start: { $set: new Date().getTime() }
					},
					substage: { $set: 'main' },
					puzzleIndex: { $set: index },
					chosen: { $set: newChosen }
				}
			});
		});
	}
	stopTimer() {
		this.setState((state) => Main.StopStateTimer(state));
	}
	getCorrectWrongEnabled() {
		const stage = this.state.state.stage;
		const substage = this.state.state.substage;
		return (stage == 'connections' || stage == 'sequences') ?
				(substage == 'main' || substage == 'secondary')
			: (stage == 'wall') ?
				(substage == 'connections')
			: (stage == 'vowels') ?
				!this.state.state.isRevealed
			: false;
	}
	getLeftRightEnabled() {
		return !this.state.state.isRevealed;
	}
	getRevealEnabled() {
		const state = this.state.state;
		return state.substage != 'choose';
	}
	getBackEnabled() {
		const stage = this.state.state.stage;
		const substage = this.state.state.substage;
		const backAllowed =
			substage != 'choose' ||
			stage != 'connections';
		return backAllowed;
	}
	getNextEnabled() {
		const stage = this.state.state.stage;
		const substage = this.state.state.substage;
		const nextAllowed =
			!(stage == 'wall' && substage == 'main');
		if (!nextAllowed)
			return false;
		const index = this.state.state.index;
		const puzzleIndex = this.state.state.puzzleIndex;
		if (stage != 'vowels')
			return index < 3;
		return index < 3 ||
			puzzleIndex < this.state.game.vowels.length - 1;
	}
	handleTimerChange(e) {
		const newVal = e.target.value;
		const isValid = TimerUI.ParseText(newVal) != null;
		e.target.setCustomValidity(isValid ? '' : 'Bad timer value.');
		this.setState((state) => update(state, {
			state: { timer: { text: { $set: newVal } } }
		}));
	}
	handleTimerStart(e) {
		e.target.blur();
		if (!this.state.state.timer.isValid())
			return;
		this.setState((state) => {
			const timeUsed = this.state.state.timer.getTimeUsed();
			if (timeUsed == null) {
				console.error('Time used null.');
				return state;
			}
			const newStart = new Date().getTime() - timeUsed;
			return update(state, {
				state: { timer: {
					text: { $set: null },
					stop: { $set: null },
					start: { $set: newStart }
				} }
			});
		});
	}
	handleTimerStop(e) {
		e.target.blur();
		this.stopTimer();
	}
	handleTimerReset(e) {
		e.target.blur();
		this.timerInput.current.setCustomValidity('');
		const currTime = new Date().getTime();
		this.setState((state) => update(state, {
			state: { timer: {
				text: { $set: null },
				stop: { $set: currTime },
				start: { $set: currTime }
			} }
		}));
	}
	handleNext(e) {
		e.target.blur();
		if (!this.getNextEnabled())
			return;
		this.setState((state) => {
			const stage = state.state.stage;
			const substage = state.state.substage;
			if (substage == 'choose') {
				const newStage =
					(stage == 'connections') ? 'sequences'
					: (stage == 'sequences') ? 'wall'
					: (stage == 'wall') ? 'vowels'
					: stage;
				const newSubstage =
					(newStage == 'vowels') ? 'main' : substage;
				const newTimer = (newStage == 'vowels') ?
					new TimerUI(VOWELS_TIMEOUT) : state.state.timer;
				if (newStage == 'vowels')
					newTimer.start = new Date().getTime();
				return update(state, {
					state: {
						timer: { $set: newTimer },
						stage: { $set: newStage },
						substage: { $set: newSubstage },
						chosen: { $set: [] }
					}
				});
			}
			const newSubstage =
				(stage == 'wall' && substage == 'idle') ? 'connections'
				: (stage == 'vowels') ? 'main'
				: substage;
			const newIndex = (state.state.index + 1) % 4;
			const newPuzzleIndex = (state.state.index == 3) ?
				state.state.puzzleIndex + 1 : state.state.puzzleIndex;
			return update(state, {
				state: {
					substage: { $set: newSubstage },
					isRevealed: { $set: false },
					index: { $set: newIndex },
					puzzleIndex: { $set: newPuzzleIndex }
				}
			});
		});
	}
	handleBack(e) {
		e.target.blur();
		if (!this.getBackEnabled())
			return;
		this.setState((state) => {
			const stage = state.state.stage;
			const substage = state.state.substage;
			if (stage == 'vowels') {
				return update(
					Main.ResetStateMicro(state, 0), {
					state: {
						stage: { $set: 'wall' },
						substage: { $set: 'choose' },
						puzzleIndex: { $set: 0 }
					}
				});
			}
			if (substage == 'choose') {
				const newStage =
					(stage == 'sequences') ? 'connections'
					: (stage == 'wall') ? 'sequences'
					: stage;
				return update(state, {
					state: {
						stage: { $set: newStage },
						substage: { $set: 'choose' },
						chosen: { $set: [] }
					}
				});
			}
			const advanceTurn = stage == 'wall';
			const turn = advanceTurn ?
				((state.state.turn + 1) % 2) : state.state.turn;
			return update(
				Main.ResetStateMicro(state, 0), {
				state: {
					turn: { $set: turn },
					substage: { $set: 'choose' },
					puzzleIndex: { $set: 0 }
				}
			});
		});
	}
	handleTurn(e) {
		e.target.blur();
		this.setState((state) => update(state, {
			state: {
				turn: { $set: (state.state.turn + 1) % 2 }
			}
		}));
	}
	handleCorrect(e) {
		e.target.blur();
		if (!this.getCorrectWrongEnabled())
			return;
		const stage = this.state.state.stage;
		if (stage == 'connections' || stage == 'sequences')
			this.setState((state) => {
				const advanceTurn = state.state.substage == 'main';
				const turn = advanceTurn ?
					((state.state.turn + 1) % 2) : state.state.turn;
				const afterInc =
					Main.IncStateScore(state, state.state.turn,
						Mechanics.IndexToPoints(state.state.index));
				return update(
					Main.StopStateTimer(afterInc), {
					state: {
						turn: { $set: turn },
						isRevealed: { $set: true },
						index: { $set: 3 },
						substage: { $set: 'idle' }
					}
				});
			});
		else if (stage == 'wall')
			this.setState((state) => {
				let inc = 1;
				if (state.state.index == 3 && state.state.wallPoints == 7)
					inc += 2;
				const afterInc =
					Main.IncStateScore(state, state.state.turn, inc);
				return update(afterInc, {
					state: {
						substage: { $set: 'idle' },
						isRevealed: { $set: true },
						wallPoints: { $set: state.state.wallPoints + 1 }
					}
				});
			});
		else if (stage == 'vowels')
			this.setState((state) => {
				const afterInc =
					Main.IncStateScore(state, state.state.turn, 1);
				return update(afterInc, {
					state: {
						substage: { $set: 'idle' },
						isRevealed: { $set: true }
					}
				});
			});
		else
			console.error(`Unrecognized stage ${stage}`);
	}
	handleWrong(e) {
		e.target.blur();
		if (!this.getCorrectWrongEnabled())
			return;
		const stage = this.state.state.stage;
		if (stage == 'connections' || stage == 'sequences')
			this.setState((state) => {
				const mainStage = state.state.substage == 'main';
				const turn = mainStage ?
					((state.state.turn + 1) % 2) : state.state.turn;
				const substage = mainStage ? 'secondary' : 'idle';
				return update(Main.StopStateTimer(state), {
					state: {
						turn: { $set: turn },
						index: { $set: 3 },
						substage: { $set: substage },
						isRevealed: { $set: substage == 'idle' }
					}
				});
			});
		else if (stage == 'wall')
			this.setState((state) => {
				return update(state, {
					state: {
						substage: { $set: 'idle' },
						isRevealed: { $set: true },
					}
				});
			});
		else if (stage == 'vowels')
			this.setState((state) => {
				const isBuzzed = state.state.substage == 'buzzed';
				const afterInc =
					Main.IncStateScore(state, state.state.turn,
						isBuzzed ? -1 : 0);
				const turn = (state.state.turn + 1) % 2;
				const substage = isBuzzed ? 'secondary' : 'idle';
				return update(afterInc, {
					state: {
						turn: { $set: turn },
						substage: { $set: substage },
						isRevealed: { $set: !isBuzzed }
					}
				});
			});
		else
			console.error(`Unrecognized stage ${stage}`);
	}
	handleLeft(e) {
		e.target.blur();
		if (!this.getLeftRightEnabled())
			return;
		this.setState((state) => {
			const afterInc =
				Main.IncStateScore(state, 0, 1);
			return update(state, {
				state: {
					turn: { $set: 0 },
					substage: { $set: 'buzzed' }
				}
			});
		});
	}
	handleRight(e) {
		e.target.blur();
		if (!this.getLeftRightEnabled())
			return;
		this.setState((state) => {
			return update(state, {
				state: {
					turn: { $set: 1 },
					substage: { $set: 'buzzed' }
				}
			});
		});
	}
	handleTurn(e) {
		e.target.blur();
		this.setState((state) => update(state, {
			state: { turn: { $set: (state.state.turn + 1) % 2 } }
		}));
	}
	handleReveal(e) {
		e.target.blur();
		if (!this.getRevealEnabled())
			return;
		this.setState((state) => {
			if (state.state.stage == 'wall' &&
					state.state.substage == 'main') {
				return update(Main.StopStateTimer(state), {
					state: {
						substage: { $set: 'connections' },
						found: { $set: [0, 1, 2, 3] }
					}
				});
			}
			return update(state, {
				state: { isRevealed: {
					$set: !state.state.isRevealed
				} }
			});
		});
	}
	handleExitConfig(e) {
		e.target.blur();
		this.setState((state) => update(state, {
			showConfig: { $set: false }
		}));
	}
	handleEnterConfig(e) {
		e.target.blur();
		this.setState((state) => update(state, {
			showConfig: { $set: true }
		}));
	}
	handleConfigChange(e) {
		const reader = new FileReader();
		reader.onload = (e) => {
			this.setState((state) => update(
				Main.ResetStateMicro(state, 0), {
				game: { $set: parseGame(JSON.parse(e.target.result)) },
				teams: {
					[0]: { score: { $set: '0' } },
					[1]: { score: { $set: '0' } },
				},
				state: {
					turn: { $set: 0 },
					stage: { $set: 'connections' },
					substage: { $set: 'choose' },
					puzzleIndex: { $set: 0 },
					chosen: { $set: [] }
				}
			}));
		};
		reader.readAsText(e.target.files[0]);
	}
	render() {
		const teamCards = [];
		const state = this.state.state;
		const stage = state.stage;
		const substage = state.substage;
		for (let i = 0; i < 2; i++) {
			const glow =
				!(stage == 'vowels' &&
					(substage == 'main' || substage == 'idle')) &&
				i == state.turn;
			teamCards.push(<TeamCard key={i} name={this.state.teams[i].name} score={this.state.teams[i].score} isOnRight={i == 1} glow={glow} onNameChange={this.teamNameChangeCallbacks[i]} onScoreChange={this.teamScoreChangeCallbacks[i]} onScoreInc={this.teamScoreIncCallbacks[i]} />);
		}
		const timer = this.state.state.timer;
		const progressVal = timer.getTimeUsed() / timer.maxTime * 100;
		const timerRed = timer.isExpired();

		const startStopButton =
			(timer.isRunning()) ?
			<button type="button" className="btn btn-md btn-danger" onClick={this.handleTimerStop}>
				Stop
			</button> :
			<button type="button" className={`btn btn-md btn-success${timer.isValid() ? '' : ' disabled'}`} onClick={this.handleTimerStart}>
				Start
			</button>;

		const chooseHeader =
			(stage == 'connections') ? 'Connections'
			: (stage == 'sequences') ? 'Sequences'
			: (stage == 'wall') ? 'Wall'
			: '';
		const isActive = timer.isRunning();
		const panel =
			(substage == 'choose') ?
				<ChoosePanel numChoices={
					(stage == 'wall') ? 2 : 6
				} chosen={state.chosen} header={chooseHeader} onClick={this.handleChooseClick} />
			: (stage == 'wall') ?
				<WallPanel data={this.state.game.walls[state.puzzleIndex]} index={state.index} progressVal={progressVal} isRevealed={state.isRevealed} strikes={state.strikes} selected={state.selected} found={state.found} onClick={this.handleWallClick} />
			: (stage == 'connections' ||
					stage == 'sequences') ?
				<ConnectionsPanel data={this.state.game[stage][state.puzzleIndex]} index={state.index} progressVal={progressVal} isRevealed={state.isRevealed} isActive={isActive} />
			: (stage == 'vowels') ?
				<VowelsPanel data={this.state.game.vowels[state.puzzleIndex]} index={state.index} isRevealed={state.isRevealed} />
			: null;

		const correctWrongDisabled = !this.getCorrectWrongEnabled();
		const leftRightDisabled = !this.getLeftRightEnabled();
		const correctWrongButtons =
			(stage == 'vowels' && substage == 'main') ? (
				<div className="btn-group mr-2">
					<button type="button" className={`btn btn-md btn-primary py-0${leftRightDisabled ? ' disabled' : ''}`} onClick={this.handleLeft}>
						<span style={{
							fontSize: '20px'
						}}>{'\u25c4'}</span>
					</button>
					<button type="button" className={`btn btn-md btn-info py-0${leftRightDisabled ? ' disabled' : ''}`} onClick={this.handleRight}>
						<span style={{
							fontSize: '20px'
						}}>{'\u25ba'}</span>
					</button>
				</div>
			) : (
				<div className="btn-group mr-2">
					<button type="button" className={`btn btn-md btn-success py-0${correctWrongDisabled ? ' disabled' : ''}`} onClick={this.handleCorrect}>
						<span style={{
							fontSize: '20px'
						}}>{'\u2714'}</span>
					</button>
					<button type="button" className={`btn btn-md btn-danger py-0${correctWrongDisabled ? ' disabled' : ''}`} onClick={this.handleWrong}>
						<span style={{
							fontSize: '20px'
						}}>{'\u2717'}</span>
					</button>
				</div>
			);
		const modal = this.state.showConfig ? [
			<div key="modal" className="modal" style={{
				display: 'block'
			}}>
				<div className="modal-dialog modal-dialog-centered">
					<div className="modal-content">
						<div className="modal-body">
							<div className="form-group row w-100">
								<label className="col-4 mb-0">
									New Game File:
								</label>
								<div className="col align-items-center">
									<input type="file" className="form-control-file" onChange={this.handleConfigChange} />
								</div>
							</div>
							<div className="container">
								<button type="button" className="btn btn-success float-right" onClick={this.handleExitConfig}>
									Done
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>,
			<div key="backdrop" className="modal-backdrop" style={{
				opacity: '0.6'
			}}>
			</div>
			] : null;

		return (
		<div className="container text-center d-flex flex-column" style={{
			maxWidth: '1000px',
			padding: '20px 35px 10px 35px',
			height: '100%'
		}}>
			{modal}
			<div className="row">
				{teamCards}
			</div>
			{panel}
			<footer className="">
				<div className="btn-toolbar w-100">
					<div className="btn-group mr-2">
						{startStopButton}
						<button type="button" className="btn btn-md btn-primary" onClick={this.handleTimerReset}>
							Reset
						</button>
					</div>
					<div className="input-group mr-2">
						<input type="text" className={`form-control input-lg${timerRed ? ' text-danger' : ''}`} value={timer.getText()} readOnly={timer.isRunning()} onChange={this.handleTimerChange} ref={this.timerInput} style={{
							border: '0',
							width: '100px',
							fontSize: '32px',
							textAlign: 'center'
						}}/>
					</div>
					{correctWrongButtons}
					<div className="btn-group mr-2">
						<button type="button" className={`btn btn-md btn-primary${this.getNextEnabled() ? '' : ' disabled'}`} onClick={this.handleNext}>
							Next
						</button>
						<button type="button" className={`btn btn-md btn-info${this.getBackEnabled() ? '' : ' disabled'}`} onClick={this.handleBack}>
							Back
						</button>
					</div>
					<div className="btn-group flex-grow-1">
						<button type="button" className="btn btn-md flex-grow-1" onClick={this.handleEnterConfig}>
							Config
						</button>
						<button type="button" className="btn btn-md btn-warning" onClick={this.handleTurn}>
							Turn
						</button>
					</div>
					<div className="btn-group ml-2">
						<button type="button" className={`btn btn-md btn-info${this.getRevealEnabled() ? '' : ' disabled'}`} onClick={this.handleReveal}>
							Reveal
						</button>
					</div>
				</div>
			</footer>
		</div>
		);
	}
};

const wrapper = document.getElementById('app-main');
wrapper ? ReactDOM.render(<Main />, wrapper) : false;

export default Main;
