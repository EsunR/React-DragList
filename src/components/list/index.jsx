import React, { Component } from 'react';
import './index.scss'

export class DragListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      top: 0,
      indexStep: 0,
      throwDomList: []
    }
    this.itemDom = React.createRef();
    this.moving = false;
    this.startY = 0;
    this.originTop = 0;
    this.zIndex = 1;
    this.stepLength = null;
    this.nextIndex = null;
  }

  componentDidUpdate(prevProps, prevState) {
    // 如果检测出经过了一个div就开始变动 trowDomList
    if (this.state.indexStep !== prevState.indexStep) {
      let throwingIndex = this.props.startIndex + this.state.indexStep; // 经过的dom索引
      let throwDomList = this.state.throwDomList

      // 如果经过的位置不是自己原来的位置
      if (throwingIndex !== this.props.startIndex) {
        let throwDom = this.itemDom.current.parentNode.children[throwingIndex];
        let inArray = throwDomList.some((item, index) => {
          if (item.innerHTML === throwDom.innerHTML) {
            throwDomList.splice(index + 1, 1)
            this.setState({ throwDomList });
            return true;
          }
        })
        if (!inArray) {
          throwDomList.push(throwDom);
          let className = this.state.indexStep > 0 ? "move-up" : "move-down";
          throwDom.classList.add(className);
          this.setState({ throwDomList });
        }
      } else {
        this.setState({ throwDomList: [] });
      }
    }
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
      let indexStep = moveY > 0 ?
        Math.ceil((moveY - this.stepLength / 2) / this.stepLength) :
        Math.floor((moveY + this.stepLength / 2) / this.stepLength)
      this.nextIndex = this.props.startIndex + indexStep;

      // 修改视图
      this.setState({
        top: this.originTop + moveY,
        indexStep
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
    // 除了自己，给兄弟节点全部套上 transition 效果
    let brotherDom = this.itemDom.current.parentNode.children
    Array.prototype.forEach.call(brotherDom, (item, index) => {
      if (index !== this.props.startIndex) {
        item.classList.add("animate");
      }
    })
  }

  handleDragOver(e) {
    if (this.state.indexStep !== 0) {
      this.props.parent.resort(this.props.startIndex, this.nextIndex);
    }
    this.moving = false;
    this.zIndex = 1;
    this.startY = 0;
    this.moveY = 0;
    this.setState({
      top: 0,
      indexStep: 0
    });
    // 清除动画样式，让元素归位
    let brotherDom = this.itemDom.current.parentNode.children
    Array.prototype.forEach.call(brotherDom, (item) => {
      item.classList.remove("move-up", "move-down", "animate");
    })
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

