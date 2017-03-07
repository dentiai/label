import React, { Component } from 'react';
import './Image.css';

let currentBox = null;
let isDrawing = false;

export default class Image extends Component {

  constructor(props) {
    super(props);

    this.state = {
      boxes: [],
      currentBoxWidth: 0,
      currentBoxHeight: 0,
    };
  }

  onMouseDown(event) {
    event.preventDefault();

    const parentBoundingRect = event.target.getBoundingClientRect();

    let startX = event.nativeEvent.pageX - parentBoundingRect.left;
    let startY = event.nativeEvent.pageY - parentBoundingRect.top;
    let endX = startX;
    let endY = startY;

    currentBox = { startX, startY, endX, endY };

    const boxes = this.state.boxes;
    boxes.push(currentBox);
    this.setState({ boxes });

    isDrawing = true;
  }

  onMouseMove(event) {
    event.preventDefault();

    if (!isDrawing) {
      return;
    }

    const parentBoundingRect = event.target.getBoundingClientRect();

    const endX = event.nativeEvent.pageX - parentBoundingRect.left;
    const endY = event.nativeEvent.pageY - parentBoundingRect.top;

    const box = this.state.boxes[0];
    box.endX = endX;
    box.endY = endY;
    this.setState({ boxes: this.state.boxes.splice(0, 1, box) });
  }

  onMouseUp(event) {
    event.preventDefault();

    isDrawing = false;
  }

  renderBox(dimensions, index) {
    return (
      <div className="Image__Box"
           key={index}
           onMouseUp={(e) => this.onMouseUp(e)}
           style={{
              top: dimensions.startY,
              left: dimensions.startX,
              width: dimensions.endX - dimensions.startX,
              height: dimensions.endY - dimensions.startY,
      }} />
    );
  }

  renderImage() {
    return (
      <div className="Image__Image">
        <img
             role="presentation"
             src={this.props.url}
             onMouseDown={(e) => this.onMouseDown(e)}
             onMouseMove={(e) => this.onMouseMove(e)}
             onMouseUp={(e) => this.onMouseUp(e)}
        />
        {this.state.boxes.map((dimensions, index) => this.renderBox(dimensions, index))}
      </div>
    );
  }

  renderError() {
    return (
      <p className="Image__Error">
        Error while loading
        <span className="Image__Url">{this.props.url}</span>
      </p>
    );
  }

  render() {
    return (
      <div className="Image">
        { this.props.error ? this.renderError() : this.renderImage() }
      </div>
    );
  }
}
