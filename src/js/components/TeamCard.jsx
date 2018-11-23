import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const TeamName = (props) => {
	function handleChange(e) {
		props.onChange(e.target.value);
	}
	const style = {
		border: '0',
		fontSize: '32px',
		textAlign: 'center'
	};
	if (props.glow) {
		style.textShadow = '0px 0px 5px yellow';
		style.color = 'saddlebrown';
	}
	return (
	<div className="col">
		<input type="text" className="form-control input-lg w-100" value={props.val} onChange={handleChange} style={style}/>
	</div>
	);
};
TeamName.propTypes = {
	val: PropTypes.string.isRequired,
	glow: PropTypes.bool.isRequired,
	onChange: PropTypes.func.isRequired
};

const TeamScore = (props) => {
	function handleChange(e) {
		props.onChange(e.target.value);
	}
	return (
	<div className="col-2 px-0">
		<input type="number" className="form-control input-lg w-100 px-0" value={ props.val } onChange={handleChange} style={{
			border: '0',
			fontSize: '32px',
			textAlign: 'center'
		}}/>
	</div>
	);
};
TeamScore.propTypes = {
	val: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired
};

class ScoreChangeButton extends Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}
	handleClick(e) {
		e.target.blur();
		this.props.onClick(this.props.val);
	}
	render() {
		const btnTextPrefix = (this.props.val < 0) ? '' : '+';
		const btnText = `${btnTextPrefix}${this.props.val}`;
		const btnClass =
			(this.props.val < 0) ? 'btn-danger' : 'btn-success';
		return (
			<button type="button" className={`btn btn-sm w-100 ${btnClass}`} onClick={this.handleClick}>
				{btnText}
			</button>
		);
	}
};
ScoreChangeButton.propTypes = {
	val: PropTypes.number.isRequired,
	onClick: PropTypes.func.isRequired
};

class TeamCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			scoreText: '0'
		};
		this.handleScoreInc = this.handleScoreInc.bind(this);
	}
	handleScoreInc(inc) {
		this.props.onScoreInc(inc);
	}
	render() {
		const SHOW_SCORE_CHANGE_BUTTONS = false;
		const buttonsTop = [], buttonsBottom = [];
		for (let i = 0; i < 5; i++) {
			buttonsTop.push(<ScoreChangeButton key={i} val={i+1} onClick={this.handleScoreInc} />);
			buttonsBottom.push(<ScoreChangeButton key={i} val={-(i+1)} onClick={this.handleScoreInc} />);
		}
		const scoreChangeButtons = SHOW_SCORE_CHANGE_BUTTONS ? [
		<div key="buttons-top" className="btn-group d-flex">
			{buttonsTop}
		</div>,
		<div key="buttons-bottom" className="btn-group d-flex">
			{buttonsBottom}
		</div>
		] : null;
		const teamScore =
			<TeamScore key="score" val={this.props.score} onChange={this.props.onScoreChange} />;
		const teamName =
			<TeamName key="name" val={this.props.name} glow={this.props.glow} onChange={this.props.onNameChange} />;
		return (
		<div className="col">
			<div key="score-card" className="row">
			{this.props.isOnRight ? [
				teamScore, teamName
			] : [
				teamName, teamScore
			]}
			</div>
			{scoreChangeButtons}
		</div>
		);
	}
};
TeamCard.propTypes = {
	name: PropTypes.string.isRequired,
	score: PropTypes.string.isRequired,
	isOnRight: PropTypes.bool.isRequired,
	glow: PropTypes.bool.isRequired,
	onNameChange: PropTypes.func.isRequired,
	onScoreChange: PropTypes.func.isRequired,
	onScoreInc: PropTypes.func.isRequired
};

export default TeamCard;
