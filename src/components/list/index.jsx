import React, { Component } from 'react';
import './index.scss'

export class DragListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moving: false,
      top: 0,
      indexStep: 0,
      throwDomList: []
    }
    this.itemDom = React.createRef();
    this.startY = 0;
    this.originTop = 0;
    this.zIndex = 1;
    this.stepLength = null;
    this.nextIndex = null;
  }

  componentDidUpdate(prevProps, prevState) {
    // 检测是否触发动画
    // 如果检测出经过了一个div就开始变动 trowDomList
    if (this.state.indexStep !== prevState.indexStep) {
      let throwingIndex = this.nextIndex; // 经过的dom索引
      let throwDomList = this.state.throwDomList

      // 如果经过的位置不是自己原来的位置
      if (throwingIndex !== this.props.startIndex) {
        let throwDom = this.itemDom.current.parentNode.children[throwingIndex];
        let inArray = throwDomList.some((item, index) => {
          if (item.innerHTML === throwDom.innerHTML) {
            throwDomList.splice(index + 1, 1)[0].classList.remove("move-up", "move-down");
            this.setState({ throwDomList });
            return true;
          } else {
            return false;
          }
        })
        if (!inArray) {
          throwDomList.push(throwDom);
          this.setState({ throwDomList });
          let className = this.state.indexStep > 0 ? "move-up" : "move-down";
          throwDom.classList.add(className);
        }
      } else {
        // 当元素被移出边界时，组件会被强制终止排序，所有组件重新渲染 throwDomList 会被重置，这时再去清除其上挂载的 class 会报错
        if (this.state.throwDomList[0]) {
          this.state.throwDomList[0].classList.remove("move-up", "move-down");
          this.setState({ throwDomList: [] });
        }
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
    e.preventDefault();
    if (this.state.moving) {
      // 缓存拖动距离
      let moveY = e.clientY - this.startY;
      // 当拖动距离距超过下一个元素的高度的一半时，移动距离 +1， 计算出下一个位置的索引值
      let indexStep = moveY > 0 ?
        Math.ceil((moveY - this.stepLength / 2) / this.stepLength) :
        Math.floor((moveY + this.stepLength / 2) / this.stepLength)
      let nextIndex = this.props.startIndex + indexStep;
      let upEdge = this.props.parent.state.data.length - 1;
      // 如果超过上下边界就强行结束拖拽
      if (nextIndex > upEdge) {
        this.handleDragOver();
        this.nextIndex = upEdge;
      } else if (nextIndex < 0) {
        this.handleDragOver();
        this.nextIndex = 0;
      } else {
        this.nextIndex = this.props.startIndex + indexStep;
        this.setState({
          top: this.originTop + moveY,
          indexStep
        })
      }
    }
  }

  handleMouseDown(e) {
    this.setState({ moving: true })
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

  handleDragOver() {
    if (this.state.moving) {
      if (this.state.indexStep !== 0) {
        this.props.parent.resort(this.props.startIndex, this.nextIndex);
      }
      this.zIndex = 1;
      this.startY = 0;
      this.moveY = 0;
      this.setState({
        top: 0,
        indexStep: 0,
        moving: false
      });
      // 清除动画样式，让元素归位
      let brotherDom = this.itemDom.current.parentNode.children
      Array.prototype.forEach.call(brotherDom, (item) => {
        item.classList.remove("move-up", "move-down", "animate");
      })
      // 如果数组列表被重新排序了，就进行事件代理，触发onSorted事件
      if (this.state.indexStep !== 0 && this.props.parent.props.onSorted) {
        try {
          this.props.parent.props.onSorted(this.props.parent.state.data);
        } catch {
          throw new Error("<DragList /> props 'onSorted' has an error, please check it out");
        }
      }
    }
  }

  render() {
    return (
      <div
        className="drag-list-item"
        ref={this.itemDom}
        style={{
          margin: `${this.props.spacing ? this.props.spacing : 0}px 0px`,
          top: this.state.top,
          zIndex: this.zIndex,
          ...this.props.parent.props.itemStyle
        }}
        onMouseDown={this.handleMouseDown.bind(this)}
        onMouseUp={this.handleDragOver.bind(this)}
        onMouseMove={this.handleMouseMove.bind(this)}
        onMouseLeave={this.handleDragOver.bind(this)}
      >
        <div className="item-content">
          {this.props.data}
        </div>
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
    // 将原数据进行拷贝隔离
    this.setState({ data: JSON.parse(JSON.stringify(this.props.data)) })
  }

  resort(prevIndex, nextIndex) {
    let cpData = this.state.data;
    cpData.splice(nextIndex, 0, cpData.splice(prevIndex, 1)[0]);
    this.setState({ data: cpData })
  }

  render() {
    let listItem = this.state.data.map((item, index) =>
      <DragListItem
        key={item.id}
        data={item.data}
        spacing={this.props.spacing}
        startIndex={index}
        parent={this}
      />
    )

    return (
      <div className="drag-list" style={{ ...this.props.style }}>
        <div
          className="drag-list-inner"
          style={{ margin: `${this.props.spacing ? - this.props.spacing : 0}px 0px`, }}
        >
          {listItem}
        </div>
      </div>
    )
  }
}

