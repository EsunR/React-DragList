import React, { Component, ReactDOM } from 'react';
import './index.scss'

export class DragListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startY: 0,
      moveY: 0,
      indexStep: 0,
      moving: false,
      originTop: 0,
      top: 0,
      zIndex: 1
    }
    this.itemDom = React.createRef();
    this.stepLength = null;
    this.nextIndex = null;
  }

  componentDidMount() {
    // 计算元素拖动的步长
    this.stepLength = this._getDomStyleNum(this.itemDom.current, "height") + this._getDomStyleNum(this.itemDom.current, "marginBottom");
  }

  _getDomStyleNum(dom, style) {
    return parseInt(window.getComputedStyle(dom)[style])
  }

  handleMouseMove(e) {
    if (this.state.moving) {
      let moveY = e.clientY - this.state.startY;
      // 当移动距离距超过下一个元素的高度的一半时，移动距离 +1
      let indexStep = moveY > 0 ?
        Math.ceil((moveY - this.stepLength / 2) / this.stepLength) :
        Math.floor((moveY + this.stepLength / 2) / this.stepLength)
      this.nextIndex = this.props.startIndex + indexStep;
      // 修改视图
      this.setState({
        moveY,
        top: this.state.originTop + moveY,
        indexStep
      })
    } else {
      return;
    }
  }

  handleMouseDown(e) {
    this.setState({
      moving: true,
      startY: e.clientY,
      originTop: this._getDomStyleNum(this.itemDom.current, "top"),
      top: this._getDomStyleNum(this.itemDom.current, "top"),
      zIndex: 999
    });
  }

  handleDragOver(e) {
    if (this.state.indexStep != 0) {
      this.props.parent.resort(this.props.startIndex, this.nextIndex);
    }
    this.setState({
      moving: false,
      zIndex: 1,
      top: 0,
      startY: 0,
      moveY: 0,
      indexStep: 0
    })
  }

  render() {
    return (
      <div className="drag-list-item" ref={this.itemDom} style={{
        margin: `${this.props.spacing ? this.props.spacing : 0}px 0px`,
        top: this.state.top,
        zIndex: this.state.zIndex
      }}>
        <div className="item-content">
          {this.props.data}
        </div>
        <div
          className="drag-handle"
          onMouseDown={this.handleMouseDown.bind(this)}
          onMouseUp={this.handleDragOver.bind(this)}
          onMouseMove={this.handleMouseMove.bind(this)}
          onMouseLeave={this.handleDragOver.bind(this)}
        ></div>
      </div>
    )
  }
}



export default class DragList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this.setState({ data: this.props.data })
  }

  resort(prevIndex, nextIndex) {
    let cpData = this.state.data;
    cpData.splice(nextIndex, 0, cpData.splice(prevIndex, 1)[0]);
    this.setState({ data: cpData })
  }

  render() {
    let listItem = this.state.data.map((item, index) =>
      <DragListItem
        key={item}
        data={item}
        spacing={this.props.spacing}
        startIndex={index}
        parent={this}
      />
    )

    return (
      <div className="drag-list" style={{
        // margin: `${this.props.spacing ? - this.props.spacing : 0}px 0px`,
        ...this.props.style
      }}>
        {listItem}
      </div>
    )
  }
}

