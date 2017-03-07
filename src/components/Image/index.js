import React, { Component } from 'react';
import { uploadJSONToBucket, downloadJSONFromBucket } from '../../util/io';
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

  componentDidMount() {
    this.loadBoxes((boxes) => this.setState({ boxes }));
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ boxes: [] });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.url !== prevProps.url) {
      this.loadBoxes((boxes) => this.setState({ boxes }));
    }
  }

  saveBoxes(boxes) {
    uploadJSONToBucket(this.getJSONFileName(), boxes);
  }

  loadBoxes(onLoad) {
    downloadJSONFromBucket(this.getJSONFileName(), onLoad);
  }

  getJSONFileName() {
    return this.props.url.substring(this.props.url.lastIndexOf('/')+1) + ".json";
  }

  onMouseDown(event) {
    event.preventDefault();

    const mouseCoordinates = this.getImageMouseCoordinatesFromMouseEvent(event);

    const startX = mouseCoordinates.x;
    const startY = mouseCoordinates.y;
    const endX = startX;
    const endY = startY;

    const newBoxDimensions = { startX, startY, endX, endY };

    this.setState({ newBoxDimensions });

    this.isDrawing = true;
  }

  onMouseMove(event) {
    event.preventDefault();

    if (!this.isDrawing) {
      return;
    }

    const newBoxDimensions = this.state.newBoxDimensions;

    const mouseCoordinates = this.getImageMouseCoordinatesFromMouseEvent(event);

    newBoxDimensions.endX = mouseCoordinates.x;
    newBoxDimensions.endY = mouseCoordinates.y;

    this.setState({ newBoxDimensions });
  }

  onMouseUp(event) {
    event.preventDefault();

    const boxes = this.state.boxes;
    boxes.push(this.state.newBoxDimensions);
    this.setState({ boxes, newBoxDimensions: null });

    this.isDrawing = false;

    this.saveBoxes(boxes);
  }

  getImageMouseCoordinatesFromMouseEvent(event) {
    const parentBoundingRect = this.imageElement.getBoundingClientRect();

    return {
      x: event.nativeEvent.pageX - parentBoundingRect.left - window.scrollX,
      y: event.nativeEvent.pageY - parentBoundingRect.top - window.scrollY,
    };
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
           onMouseDown={e => this.onMouseDown(e)}
           onMouseMove={e => this.onMouseMove(e)}
           onMouseUp={e => this.onMouseUp(e)}
      >
        { this.props.error ? this.renderError() : this.renderImage() }
      </div>
    );
  }
}
