import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { ConnectionsData, TileData } from '../game/GameData.js';
import Mechanics from '../game/Mechanics.js';
import { SetTileImageStyle } from './Tile.jsx';

const ConnectionsTile = (props) => {
	const isOverlay = props.mode == ConnectionsTile.MODE_OVERLAY;
	const hasImage = isOverlay ||
		(props.mode == ConnectionsTile.MODE_PICTURE);
	const hasAudio = props.mode == ConnectionsTile.MODE_MUSIC;
	const textOverride =
		(props.mode == ConnectionsTile.MODE_QUESTIONMARK) ? '?'
		: (props.mode == ConnectionsTile.MODE_MUSIC) ? '\uD834\uDD1E'
		: null;
	const hasText = isOverlay || textOverride ||
		(props.mode == ConnectionsTile.MODE_TEXT);
	const text = (textOverride != null) ? textOverride : props.data.text;
	const textElem = (textOverride != null) ?
		<h1 style={{
			fontSize: '100px'
		}}>{text}</h1> :
		<h2>{text}</h2>;
	const style = {
		height: '200px',
		overflowWrap: 'anywhere',
	};
	if (hasImage)
		SetTileImageStyle(style, props.data.image, isOverlay);
	const pictureDiv = (
		<div className="w-100 d-flex justify-content-center align-items-center" style={style} dangerouslySetInnerHTML={
			(props.mode == ConnectionsTile.MODE_HTML) ? {__html: props.data.html} : null
		}>
			{hasText ? textElem : null}
		</div>
	);
	const audioElem = (hasAudio && props.isActive) ?
		<audio autoPlay loop src={props.data.audio} />
		: null;
	return (
	<div className={`col d-flex flex-column justify-content-center${props.hidden ? ' invisible' : ''}`}>
		<div className={`progress position-relative${props.timerHidden ? ' invisible' : ''}`} style={{
			margin: '10px 0px',
			height: '30px',
			backgroundColor: '#66e'
		}}>
			<div className="progress-bar" style={{
				backgroundColor: '#448',
				transition: 'width .1s ease',
				width: `${props.progressVal}%`
			}}>
			</div>
			<div style={{
				position: 'absolute',
				right: '0',
				left: '0'
			}}>
				<h4 className="text-light" style={{
					textShadow: '1px 1px #333'
				}}>
					{props.points} Points
				</h4>
			</div>
		</div>
		{pictureDiv}
		{audioElem}
	</div>
	);
};
ConnectionsTile.propTypes = {
	points: PropTypes.number.isRequired,
	hidden: PropTypes.bool.isRequired,
	timerHidden: PropTypes.bool.isRequired,
	progressVal: PropTypes.number.isRequired,
	data: PropTypes.instanceOf(TileData).isRequired,
	mode: PropTypes.number.isRequired,
	isActive: PropTypes.bool.isRequired
};
ConnectionsTile.MODE_PICTURE = 0;
ConnectionsTile.MODE_TEXT = 1;
ConnectionsTile.MODE_OVERLAY = 2;
ConnectionsTile.MODE_QUESTIONMARK = 3;
ConnectionsTile.MODE_MUSIC = 4;
ConnectionsTile.MODE_HTML = 5;

class ConnectionsPanel extends Component {
	constructor(props) {
		super(props);
	}
	getTileType(data, isRevealed) {
		if ('audio' in data)
			return isRevealed ? ConnectionsTile.MODE_TEXT :
				ConnectionsTile.MODE_MUSIC;
		else if ('image' in data)
			return (!data.isSequence && isRevealed) ?
					ConnectionsTile.MODE_OVERLAY :
				ConnectionsTile.MODE_PICTURE;
		else if ('html' in data)
			return ConnectionsTile.MODE_HTML;
		else
			return ConnectionsTile.MODE_TEXT;
	}
	render() {
		const tiles = [];
		const data = this.props.data;
		for (let i = 0; i < 4; i++) {
			const points = Mechanics.IndexToPoints(i);
			const lastInSequence = data.isSequence && i == 3;
			const atSecondLast = this.props.index == 2;
			const hidden = !this.props.isRevealed && (
				i > this.props.index && !(
				atSecondLast && lastInSequence));
			const type = (lastInSequence && !this.props.isRevealed) ?
				ConnectionsTile.MODE_QUESTIONMARK
				: this.getTileType(data.data[i],
					this.props.isRevealed);
			const isActive = this.props.isActive && this.props.index == i;
			tiles.push(<ConnectionsTile key={i} points={points} data={data.data[i]} hidden={hidden} timerHidden={i != this.props.index} progressVal={this.props.progressVal} mode={type} isActive={isActive} />);
		}
		return [
		<div key="tiles" className="row flex-fill">
			<div className="col d-flex flex-column justify-content-center">
				<div className="row">
					{tiles}
				</div>
				<div className="row">
					<div className={`col${this.props.isRevealed ? '' : ' invisible'}`} style={{
						color: 'midnightblue'
					}}>
						<h3>{data.solution}</h3>
					</div>
				</div>
			</div>
		</div>
		];
	}
};
ConnectionsPanel.propTypes = {
	data: PropTypes.instanceOf(ConnectionsData).isRequired,
	index: PropTypes.number.isRequired,
	progressVal: PropTypes.number.isRequired,
	isRevealed: PropTypes.bool.isRequired,
	isActive: PropTypes.bool.isRequired
};

export default ConnectionsPanel;
