import React, { Component, Fragment } from 'react';

export class DragListItem extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return (
      <Fragment>
        this is item
      </Fragment>
    )
  }
}



export class DragList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Fragment>
        <div className="list-area">
          
        </div>
      </Fragment>
    )
  }
}

