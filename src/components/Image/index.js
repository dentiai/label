import React, { Component } from 'react';
import './Image.css';

export default class Image extends Component {

  constructor(props) {
    super(props);

    this.isDrawing = false;

    this.imageElement = null;

    this.state = {
      boxes: [],
      newBoxDimensions: null,
    };
  }

  onMouseDown(event) {
    event.preventDefault();

    const parentBoundingRect = this.imageElement.getBoundingClientRect();

    let startX = event.nativeEvent.pageX - parentBoundingRect.left;
    let startY = event.nativeEvent.pageY - parentBoundingRect.top;
    let endX = startX;
    let endY = startY;

    const newBoxDimensions = { startX, startY, endX, endY };

    this.setState({ newBoxDimensions });

    this.isDrawing = true;
  }

  onMouseMove(event) {
    event.preventDefault();

    if (!this.isDrawing) {
      return;
    }

    const parentBoundingRect = this.imageElement.getBoundingClientRect();

    const endX = event.nativeEvent.pageX - parentBoundingRect.left;
    const endY = event.nativeEvent.pageY - parentBoundingRect.top;

    const newBoxDimensions = this.state.newBoxDimensions;

    newBoxDimensions.endX = endX;
    newBoxDimensions.endY = endY;

    this.setState({ newBoxDimensions });
  }

  onMouseUp(event) {
    event.preventDefault();

    const boxes = this.state.boxes;
    boxes.push(this.state.newBoxDimensions);
    this.setState({ boxes, newBoxDimensions: null });

    this.isDrawing = false;
  }

  renderBox(dimensions, index) {
    let boxStyle = {};

    // we handle drawing starting at any corner of the rectangle (box) and
    // convert the x,y dimensions to CSS properties
    if (dimensions.startX <= dimensions.endX) {
      boxStyle.left = dimensions.startX;
      boxStyle.width = dimensions.endX - dimensions.startX;
    } else {
      boxStyle.left = dimensions.endX;
      boxStyle.width = dimensions.startX - dimensions.endX;
    }

    if (dimensions.startY <= dimensions.endY) {
      boxStyle.top = dimensions.startY;
      boxStyle.height = dimensions.endY - dimensions.startY;
    } else {
      boxStyle.top = dimensions.endY;
      boxStyle.height = dimensions.startY - dimensions.endY;
    }

    return (
      <div className="Image__Box"
           key={index}
           style={boxStyle}
      />
    );
  }

  renderImage() {
    return (
      <div className="Image__Image">
        <img
             role="presentation"
             src={this.props.url}
             ref={(img) => this.imageElement = img}
        />

        {this.state.newBoxDimensions !== null ? this.renderBox(this.state.newBoxDimensions) : ''}

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
      <div className="Image"
           onMouseDown={(e) => this.onMouseDown(e)}
           onMouseMove={(e) => this.onMouseMove(e)}
           onMouseUp={(e) => this.onMouseUp(e)}
      >
        { this.props.error ? this.renderError() : this.renderImage() }
      </div>
    );
  }
}
