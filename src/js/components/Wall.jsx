import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const WallPanel = (props) => {
	const foundPerm = [];
	const mainPerm = props.data.perm.filter((index) =>
		!props.found.includes(Math.trunc(index / 4))
	);
	for (let i = 0; i < props.found.length; i++) {
		foundPerm.push(...props.data.perm.filter((index) =>
			(Math.trunc(index / 4) == props.found[i])
		));
	}
	const rows = [];
	let solution = (props.found.length == 4) ?
		props.data.groups[props.found[props.index]].solution : '';
	for (let i = 0; i < 4; i++) {
		const cols = [];
		for (let j = 0; j < 4; j++) {
			const found = i < props.found.length;
			const index = 
				found ? (foundPerm[i * 4 + j])
				: mainPerm[(i - props.found.length) * 4 + j];
			const btnColor =
				(props.selected.includes(index)) ? 'btn-dark'
				: found ? WallPanel.btnColors[i] :
				'btn-light';
			const handleClick = ((index) => ((e) => {
				e.target.blur();
				props.onClick(index);
			}))(index);
			const btnText =
				props.data.groups[Math.trunc(index / 4)].data[index % 4];
			const disabled = props.found.length == 4 && props.index != i;
			const btnStyle = disabled ? {
				opacity: '.3'
			} : {};
			cols.push(
			<div key={j} className="col d-flex justify-content-center align-items-center px-0">
				<button type="button" className={`btn btn-lg w-100 h-100 ${btnColor}${disabled ? ' disabled' : ''}`} onClick={handleClick} style={btnStyle}>
					<h2 className="mb-0">{btnText}</h2>
				</button>
			</div>
			);
		}
		rows.push(
		<div key={i} className="row flex-fill w-100 align-self-center">
			{cols}
		</div>
		);
	}
	const strikes = [];
	for (let i = 0; i < 3; i++) {
		const content = (props.strikes > i) ?
			<h2 key={i} className="mb-0 text-danger">{'\u2717'}</h2>
			: <h2 key={i} className="mb-0 text-info"><b>{'\u03c0'}</b></h2>;
		strikes.push(content);
	}
	const strikesVisible = props.found.length >= 2;
	rows.push(
	<div key={'stats'} className="row">
		<div className="col d-flex align-items-center">
			<div className={`d-flex justify-content-around align-items-center${strikesVisible ? '' : ' invisible'}`} style={{
				width: '120px'
			}}>
				{strikes}
			</div>
			<div className="progress position-relative flex-fill ml-2" style={{
				margin: '10px 0px',
				backgroundColor: '#66e'
			}}>
				<div className="progress-bar" style={{
					backgroundColor: '#448',
					transition: 'width .1s ease',
					width: `${props.progressVal}%`
				}}>
				</div>
			</div>
		</div>
	</div>
	);
	rows.push(
		<div key="solution" className="row">
			<div className={`col${props.isRevealed ? '' : ' invisible'}`} style={{
				color: 'midnightblue'
			}}>
				<h3>{solution}</h3>
			</div>
		</div>
	);
	return rows;
};
WallPanel.btnColors = [
	'btn-success', 'btn-danger', 'btn-warning', 'btn-info'
];
WallPanel.propTypes = {
	index: PropTypes.number.isRequired,
	progressVal: PropTypes.number.isRequired,
	selected: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
	found: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
	strikes: PropTypes.number.isRequired,
	isRevealed: PropTypes.bool.isRequired,
	onClick: PropTypes.func.isRequired
};

export default WallPanel;
