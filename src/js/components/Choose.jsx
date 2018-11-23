import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const ChoosePanel = (props) => {
	const rows = [];
	for (let i = 0; i < 2; i++) {
		const row = [];
		for (let j = 0; j < 3; j++) {
			if (props.numChoices == 2 && (j == 0 || j == 2))
				continue;
			const index = i * 3 + j;
			const chosenIndex =
				(props.numChoices == 2) ? (index - 1) / 3 : index;
			const disabled = props.chosen.includes(chosenIndex);
			const handleClick = ((index, disabled) => ((e) => {
				e.target.blur();
				props.onClick(index);
			}))(chosenIndex, disabled);
			row.push(
			<div key={j} className="col p-0 m-1">
				<button type="button" className={`btn btn-dark m-0 p-0 w-100${disabled ? ' disabled' : ''}`} onClick={handleClick} style={{
					backgroundColor: 'navy'
				}}>
					<h1 style={{
						fontSize: '100px'
					}}>{ChoosePanel.HIEROGLYPHS[index]}</h1>
				</button>
			</div>
			);
		}
		rows.push(
		<div key={i} className="row w-100">
			{row}
		</div>,
		);
	}
	return [
	<div key="buttons" className={`container align-self-center ${(props.numChoices == 2) ? 'w-25' : 'w-50'} flex-fill d-flex flex-column justify-content-center align-items-center`}>
		<div className="container">
			<h1>{props.header}</h1>
		</div>
		{rows[0]}
		{rows[1]}
	</div>
	];
};
ChoosePanel.propTypes = {
	numChoices: PropTypes.number.isRequired,
	header: PropTypes.string.isRequired,
	chosen: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
	onClick: PropTypes.func.isRequired
};
ChoosePanel.HIEROGLYPHS = [
	'\ud80c\uddcc',
	'\ud80c\udced',
	'\ud80c\udf9b',
	'\ud80c\udd91',
	'\ud80c\ude17',
	'\ud80c\udc80'
];

export default ChoosePanel;
