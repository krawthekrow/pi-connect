import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {VowelsData} from '../game/GameData.js';

const VowelsPanel = (props) => {
	const text = props.isRevealed ? props.data.data[props.index].solution
		: props.data.data[props.index].clue;
	return [
		<div key="tiles" className="row flex-fill">
			<div className="col d-flex flex-column justify-content-center">
				<div className="container">
					<h3 className="text-muted">{props.data.desc}</h3>
				</div>
				<div className={`container${props.showPuzzle ? '' : ' invisible'}`}>
					<h1>{text}</h1>
				</div>
			</div>
		</div>
	];
};
VowelsPanel.propTypes = {
	data: PropTypes.instanceOf(VowelsData).isRequired,
	showPuzzle: PropTypes.bool.isRequired,
	index: PropTypes.number.isRequired,
	isRevealed: PropTypes.bool.isRequired
};

export default VowelsPanel;
