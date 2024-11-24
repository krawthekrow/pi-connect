import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import GardinerFont from '../../fonts/Gardiner-reduced.ttf';

const ChoosePanel = (props) => {
	const rows = [];

	let numColumns = (props.numChoices == 2) ? 1 : 3;
	let numRows = Math.ceil(props.numChoices / numColumns);

	for (let i = 0; i < numRows; i++) {
		const row = [];
		for (let j = 0; j < numColumns; j++) {
			const index = i * numColumns + j;
			if (index >= props.numChoices) {
				break;
			}
			const disabled = props.chosen.includes(index);
			const handleClick = (e) => {
				e.target.blur();
				props.onClick(index);
			};
			row.push(
				<div key={j} className="col p-0 m-1" style={{maxWidth: (numColumns == 3 ? 'calc(33% - .5rem)' : undefined)}}>
					<button
					 type="button"
					 className={`btn btn-dark m-0 p-0 w-100${disabled ? ' disabled' : ''}`}
					 onClick={handleClick}
					 style={{
						backgroundColor: 'navy'
					 }}>
						<h1 style={{
							fontSize: '100px',
							fontFamily: 'Gardiner'
						}}>{ChoosePanel.HIEROGLYPHS[index % ChoosePanel.HIEROGLYPHS.length]}</h1>
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
		{rows}
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
	'\ud80c\udc80',

	// Extended set... picked randomly from the set of Unicode hieroglyphs
	'\uD80C\uDCFD',
	'\uD80C\uDF70',
	'\uD80C\uDD03',
	'\uD80C\uDDEC',
	'\uD80C\uDDD6',
	'\uD80C\uDF8B',
];

export default ChoosePanel;
