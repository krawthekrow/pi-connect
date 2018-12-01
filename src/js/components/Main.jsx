import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import TeamCard from './TeamCard.jsx';
import TimerUI from '../game/TimerUI.jsx';
import ConnectionsPanel from './Connections.jsx';
import ChoosePanel from './Choose.jsx';
import WallPanel from './Wall.jsx';
import VowelsPanel from './Vowels.jsx';
import GameData from '../game/GameData.js';
import Mechanics from '../game/Mechanics.js';
import GameState from '../game/GameState.js';
import SAMPLE_GAME from '../game/SampleGame.js';

const CONNECTIONS_TIMEOUT = 40 * 1000;
const WALL_TIMEOUT = 2.5 * 60 * 1000;
const WALL_WRONG_GUESS_TIMEOUT = 0.5 * 1000;
const VOWELS_TIMEOUT = 90 * 1000;
const BUZZ_TEST_TIMEOUT = 0.2 * 1000;

class Gamepad {
	constructor(index, teamId) {
		this.index = index;
		this.teamId = teamId;
		this.buzzed = null;
	}
};

const GamepadsConfig = (props) => {
	const icons = [];
	if (props.gamepads.length == 0)
		return <p className="text-left px-1">No buzzers connected!</p>;
	icons.push(<p className="text-left px-1 mb-1" key="header">
		Buzzers detected (click to change team assignment):
	</p>);
	for (const [index, g] of props.gamepads.entries()) {
		const handleClick = ((index) => ((e) => {
			e.target.blur();
			props.onClick(index);
		}))(index);
		const buzzed = g.buzzed != null &&
			new Date().getTime() - g.buzzed < BUZZ_TEST_TIMEOUT;
		const btnColor = (!buzzed) ? 'btn-light' :
			(g.teamId == 0) ? 'btn-success' : 'btn-danger';
		icons.push(
		<button className={`mx-1 btn ${btnColor}`} key={g.index} onClick={handleClick}>
			{(g.teamId == 0) ? 'Left Team' : 'Right Team'}
		</button>
		);
	}
	return (
	<div>
		{icons}
	</div>
	);
}
GamepadsConfig.propTypes = {
	gamepads: PropTypes.arrayOf(PropTypes.instanceOf(Gamepad)),
	onClick: PropTypes.func
}

function parseGame(jsonData) {
	return new GameData(jsonData);
}

class Main extends Component {
	constructor(props) {
		super(props);

		this.state = {
			game: new GameState(parseGame(SAMPLE_GAME)),
			showConfig: true,
			coinToss: null,
			gamepads: []
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

		this.gamepadsPrev = [];

		this.handleCoinToss = this.handleCoinToss.bind(this);
		this.onFrame = this.onFrame.bind(this);
		this.handleWallClick = this.handleWallClick.bind(this);
		this.handleChooseClick = this.handleChooseClick.bind(this);
		this.handleTimerChange = this.handleTimerChange.bind(this);
		this.handleTimerStart = this.handleTimerStart.bind(this);
		this.handleTimerStop = this.handleTimerStop.bind(this);
		this.handleTimerReset = this.handleTimerReset.bind(this);
		this.handlePrev = this.handlePrev.bind(this);
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
		this.handleGamepadClick = this.handleGamepadClick.bind(this);
	}
	componentDidMount() {
		window.requestAnimationFrame(this.onFrame);
		window.addEventListener('gamepadconnected', (e) => {
			const gamepad = e.gamepad;
			this.gamepadsPrev[gamepad.index] =
				Main.GetGamepadSummary(gamepad);
			this.setState((state) => {
				if (state.gamepads.some(g => g.index == gamepad.index))
					return state;
				const teamId = state.gamepads.some(
					g => g.teamId == 0) ? 1 : 0;
				return update(state, {
					gamepads: { $push: [new Gamepad(
						gamepad.index, teamId
					)] }
				});
			});
		});
		window.addEventListener('gamepaddisconnected', (e) => {
			const gamepad = e.gamepad;
			delete this.gamepadsPrev[gamepad.index];
			this.setState((state) => {
				const arrPos = state.gamepads.findIndex(
					g => g.index == gamepad.index);
				if (arrPos == -1)
					return state;
				return update(state, {
					gamepads: { $splice: [[arrPos, 1]] }
				});
			});
		});
	}
	static GetGamepadSummary(g) {
		return {
			buttons: g.buttons.map(b => b.pressed),
			axes: g.axes.slice(0)
		};
	}
	onFrame() {
		this.setState((state) => {
			const gamepadsPoll = navigator.getGamepads() ||
				navigator.webkitGetGamepads() || [];
			const gamepads = state.gamepads.slice(0);
			const buzzed = [false, false];
			for (const g of gamepads) {
				if (!gamepadsPoll[g.index].connected)
					continue;
				if (!(g.index in this.gamepadsPrev))
					continue;
				const gamepad =
					Main.GetGamepadSummary(gamepadsPoll[g.index]);
				const gamepadPrev = this.gamepadsPrev[g.index];
				this.gamepadsPrev[g.index] = gamepad;
				const someButton = gamepad.buttons.some((b, j) => {
					return b != gamepadPrev.buttons[j];
				});
				const someAxis = gamepad.axes.some((a, j) => {
					return Math.abs(a - gamepadPrev.axes[j]) > 0.05;
				});
				if (someButton || someAxis) {
					g.buzzed = new Date().getTime();
					buzzed[g.teamId] = true;
				}
			}
			const buzzTeam =
				(buzzed[0] && buzzed[1]) ?
					Math.floor(Math.random() * 2)
				: buzzed[0] ? 0
				: buzzed[1] ? 1
				: null;
			const afterBuzz = (buzzTeam != null) ?
				state.game.getBuzz(buzzTeam) : state.game;
			return update(state, {
				game: { $set:
					afterBuzz.getUpdateCurrTime()
					.getUpdateTimer().getUpdateWrongGuessPenalty()
				},
				gamepads: { $set: gamepads }
			})
		});
		window.requestAnimationFrame(this.onFrame);
	}
	tossCoin() {
		this.setState((state) => update(state, {
			coinToss: { $set: Math.floor(Math.random() * 2) == 0 }
		}));
	}
	handleCoinToss(e) {
		e.target.blur();
		this.tossCoin();
	}
	handleTeamNameChange(teamId, newVal) {
		this.setState((state) => update(state, { game: { $set:
			state.game.getChangeTeamName(teamId, newVal)
		}}));
	}
	handleTeamScoreChange(teamId, newVal) {
		this.setState((state) => update(state, { game: { $set:
			state.game.getChangeScore(teamId, newVal)
		}}));
	}
	handleTeamScoreInc(teamId, inc) {
		this.setState((state) => update(state, { game: { $set:
			state.game.getIncScore(teamId, inc)
		}}));
	}
	handleWallClick(index) {
		this.setState((state) => update(state, { game: { $set:
			state.game.getWallClick(index)
		}}));
	}
	handleChooseClick(index) {
		this.setState((state) => update(state, { game: { $set:
			state.game.getChoose(index)
		}}));
	}
	handleTimerChange(e) {
		const newVal = e.target.value;
		const isValid = TimerUI.ParseText(newVal) != null;
		e.target.setCustomValidity(isValid ? '' : 'Bad timer value.');
		this.setState((state) => update(state, { game: { $set:
			state.game.getChangeTimer(newVal)
		}}));
	}
	handleTimerStart(e) {
		e.target.blur();
		this.setState((state) => update(state, { game: { $set:
			state.game.getStartTimer()
		}}));
	}
	handleTimerStop(e) {
		e.target.blur();
		this.setState((state) => update(state, { game: { $set:
			state.game.getStopTimer()
		}}));
	}
	handleTimerReset(e) {
		e.target.blur();
		this.timerInput.current.setCustomValidity('');
		this.setState((state) => update(state, { game: { $set:
			state.game.getResetTimer()
		}}));
	}
	handlePrev(e) {
		e.target.blur();
		this.setState((state) => update(state, { game: { $set:
			state.game.getPrev()
		}}));
	}
	handleNext(e) {
		e.target.blur();
		this.setState((state) => update(state, { game: { $set:
			state.game.getNext()
		}}));
	}
	handleBack(e) {
		e.target.blur();
		this.setState((state) => update(state, { game: { $set:
			state.game.getBack()
		}}));
	}
	handleCorrect(e) {
		e.target.blur();
		this.setState((state) => update(state, { game: { $set:
			state.game.getCorrect()
		}}));
	}
	handleWrong(e) {
		e.target.blur();
		this.setState((state) => update(state, { game: { $set:
			state.game.getWrong()
		}}));
	}
	handleLeft(e) {
		e.target.blur();
		this.setState((state) => update(state, { game: { $set:
			state.game.getBuzz(0)
		}}));
	}
	handleRight(e) {
		e.target.blur();
		this.setState((state) => update(state, { game: { $set:
			state.game.getBuzz(1)
		}}));
	}
	handleTurn(e) {
		e.target.blur();
		this.setState((state) => update(state, { game: { $set:
			state.game.getChangeTurn()
		}}));
	}
	handleReveal(e) {
		e.target.blur();
		this.setState((state) => update(state, { game: { $set:
			state.game.getReveal()
		}}));
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
			showConfig: { $set: true },
			coinToss: { $set: null }
		}));
	}
	handleConfigChange(e) {
		const reader = new FileReader();
		reader.onload = (e) => {
			this.setState((state) => update(state, { game: { $set:
				state.game.getNewGame(
					parseGame(JSON.parse(e.target.result)))
			}}));
		};
		reader.readAsText(e.target.files[0]);
	}
	handleGamepadClick(gamepadId) {
		this.setState((state) => update(state, {
			gamepads: { [gamepadId]: { teamId: {
				$set: (state.gamepads[gamepadId].teamId + 1) % 2
			} } }
		}));
	}
	render() {
		const teamCards = [];
		const game = this.state.game;
		const stage = game.stage;
		const substage = game.substage;
		for (let i = 0; i < 2; i++) {
			const glow =
				!(stage == GameState.STAGE_VOWELS &&
					(substage == GameState.SUBSTAGE_CATEGORY ||
					substage == GameState.SUBSTAGE_MAIN)) &&
				i == game.turn;
			teamCards.push(<TeamCard key={i} name={game.teams[i].name} score={game.teams[i].score} isOnRight={i == 1} glow={glow} onNameChange={this.teamNameChangeCallbacks[i]} onScoreChange={this.teamScoreChangeCallbacks[i]} onScoreInc={this.teamScoreIncCallbacks[i]} />);
		}
		const timer = game.timer;
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
			(stage == GameState.STAGE_CONNECTIONS) ? 'Connections'
			: (stage == GameState.STAGE_SEQUENCES) ? 'Sequences'
			: (stage == GameState.STAGE_WALL) ? 'Wall'
			: '';
		const isActive = timer.isRunning();
		const panel =
			(substage == GameState.SUBSTAGE_CHOOSE) ?
				<ChoosePanel numChoices={
					(stage == GameState.STAGE_WALL) ? 2 : 6
				} chosen={game.chosen} header={chooseHeader} onClick={this.handleChooseClick} />
			: (stage == GameState.STAGE_WALL) ?
				<WallPanel data={game.game.walls[game.puzzleIndex]} index={game.clueIndex} progressVal={progressVal} isRevealed={game.isRevealed} strikes={game.wall.strikes} selected={game.wall.selected} found={game.wall.found} onClick={this.handleWallClick} />
			: (this.state.game.isConnectionsTypeStage()) ?
				<ConnectionsPanel data={(stage == GameState.STAGE_CONNECTIONS) ? game.game.connections[game.puzzleIndex] : game.game.sequences[game.puzzleIndex]} index={game.clueIndex} progressVal={progressVal} isRevealed={game.isRevealed} isActive={isActive} />
			: (stage == GameState.STAGE_VOWELS) ?
				<VowelsPanel data={game.game.vowels[game.puzzleIndex]} index={game.clueIndex} isRevealed={game.isRevealed} showPuzzle={substage != GameState.SUBSTAGE_CATEGORY} />
			: null;

		const correctWrongDisabled = !game.isCorrectWrongEnabled();
		const leftRightDisabled = !game.isLeftRightEnabled();
		const correctWrongButtons =
			(stage == GameState.STAGE_VOWELS && (
				substage == GameState.SUBSTAGE_CATEGORY ||
				substage == GameState.SUBSTAGE_MAIN
			)) ? (
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
						}}>{'\u2713'}</span>
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
							<div className="row w-100">
								<div className="col text-left">
									<p className="px-1">
										Use <a href="https://github.com/krawthekrow/pi-connect-maker">pi-connect-maker</a> to generate a game file, and read the <a href="https://github.com/krawthekrow/pi-connect">Github README</a> to learn how to use this web app!
									</p>
									<p className="px-1">
										You can also just click "Done" and play around, but only sample clues will be used.
									</p>
									<p className="px-1">
										<a onClick={this.handleCoinToss} href="javascript:void(0);">
											Coin toss
										</a>: {
											(this.state.coinToss == null) ?
												'(click to toss)'
											: this.state.coinToss ?
												'Heads/Left'
											: 'Tails/Right'
										}
									</p>
								</div>
							</div>
							<div className="row w-100">
								<div className="col">
									<GamepadsConfig gamepads={this.state.gamepads} onClick={this.handleGamepadClick} />
								</div>
							</div>
							<div className="form-group row w-100 mt-2">
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
						<button type="button" className={`btn btn-md btn-info${game.isPrevEnabled() ? '' : ' disabled'}`} onClick={this.handlePrev}>
							Prev
						</button>
						<button type="button" className={`btn btn-md btn-primary${game.isNextEnabled() ? '' : ' disabled'}`} onClick={this.handleNext}>
							Next
						</button>
					</div>
					<div className="btn-group mr-2">
						<button type="button" className={`btn btn-md btn-info${game.isBackEnabled() ? '' : ' disabled'}`} onClick={this.handleBack}>
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
						<button type="button" className={`btn btn-md btn-info${game.isRevealEnabled() ? '' : ' disabled'}`} onClick={this.handleReveal}>
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
