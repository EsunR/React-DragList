import React, { Component } from 'react';
import './index.scss'

export class DragListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      top: 0
    }
    this.itemDom = React.createRef();
    this.moving = false;
    this.startY = 0;
    this.indexStep = 0;
    this.originTop = 0;
    this.zIndex = 1;
    this.stepLength = null;
    this.nextIndex = null;
  }

  _getDomStyleNum(dom, style) {
    return parseInt(window.getComputedStyle(dom)[style])
  }

  componentDidMount() {
    // 计算元素拖动的步长
    this.stepLength = this._getDomStyleNum(this.itemDom.current, "height") + this._getDomStyleNum(this.itemDom.current, "marginBottom");
  }

  handleMouseMove(e) {
    if (this.moving) {
      // 缓存拖动距离
      let moveY = e.clientY - this.startY;

      // 当拖动距离距超过下一个元素的高度的一半时，移动距离 +1， 计算出下一个位置的索引值
      this.indexStep = moveY > 0 ?
        Math.ceil((moveY - this.stepLength / 2) / this.stepLength) :
        Math.floor((moveY + this.stepLength / 2) / this.stepLength)
      this.nextIndex = this.props.startIndex + this.indexStep;

      // 修改视图
      this.setState({
        top: this.originTop + moveY
      })
    } else {
      return;
    }
  }

  handleMouseDown(e) {
    this.moving = true;
    this.zIndex = 999;
    this.startY = e.clientY;
    this.originTop = this._getDomStyleNum(this.itemDom.current, "top");
  }

  handleDragOver(e) {
    if (this.indexStep !== 0) {
      this.props.parent.resort(this.props.startIndex, this.nextIndex);
    }
    this.moving = false;
    this.zIndex = 1;
    this.startY = 0;
    this.moveY = 0;
    this.indexStep = 0;
    this.setState({ top: 0 });
  }

  render() {
    return (
      <div className="drag-list-item" ref={this.itemDom} style={{
        margin: `${this.props.spacing ? this.props.spacing : 0}px 0px`,
        top: this.state.top,
        zIndex: this.zIndex
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

