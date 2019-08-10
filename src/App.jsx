import React, { Component } from 'react';
import DragList from './components/list';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: ['数据1', '数据2', '数据3', '数据4']
		}
	}

	render() {
		return (
			<div className="App">
				<h3>这是一个拖拽列表dmon</h3>
				<DragList
					data={this.state.data}
					style={{ width: "300px" }}
					spacing={20}
				/>
			</div >
		);
	}
}

export default App;
