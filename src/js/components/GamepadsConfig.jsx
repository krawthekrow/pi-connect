import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

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

export default GamepadsConfig;
