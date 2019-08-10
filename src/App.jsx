import React, { Component } from 'react';
import DragList from './components/list';
import './App.scss';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [
				{
					data: "数据1",
					id: 1
				},
				{
					data: "数据2",
					id: 2
				},
				{
					data: "数据3",
					id: 3
				},
				{
					data: "数据4",
					id: 4
				},
				{
					data: "数据5",
					id: 5
				},
				{
					data: "数据6",
					id: 6
				}
			]
		}
	}

	handleSorted(sortedData) {
		console.log(sortedData);
	}

	render() {
		return (
			<div className="App">
				<h3>这是一个拖拽列表demo</h3>
				<DragList
					data={this.state.data}
					style={{
						width: "300px",
						border: "5px solid skyblue",
						padding: "20px"
					}}
					spacing={20}
					onSorted={this.handleSorted}
				/>
			</div >
		);
	}
}

export default App;
