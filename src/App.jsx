import React from 'react';
import { DragList, DragListItem } from './components/list';

function App() {
	return (
		<div className="App">
			<h3>这是一个拖拽列表dmon</h3>
			<DragList>
				<DragListItem>
					hahah
				</DragListItem>
			</DragList>
		</div>
	);
}

export default App;
