import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Main extends Component {
	render() {
		return (
			<div>Test</div>
		);
	}
};

const wrapper = document.getElementById('app-main');
wrapper ? ReactDOM.render(<Main />, wrapper) : false;

export default Main;
