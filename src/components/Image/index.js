import React, { Component } from 'react';
import { uploadJSONToBucket, downloadJSONFromBucket } from '../../util/io';
import './Image.css';

const drawState = {
  default:  'default',
  drawing:  'drawing',
  moving:   'moving',
  resizing: 'resizing',
};

export default class Image extends Component {

  constructor(props) {
    super(props);

    this.imageElement = null;

    this.drawState = drawState.default;

    this.editingBoxIndex = null;

    this.mouseBoxDeltaX = 0;
    this.mouseBoxDeltaY = 0;

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

  onMouseDownOnImage(event) {
    const mouseCoordinates = this.getImageMouseCoordinatesFromMouseEvent(event);

    const startX = mouseCoordinates.x;
    const startY = mouseCoordinates.y;
    const endX = startX;
    const endY = startY;

    const newBoxDimensions = { startX, startY, endX, endY };

    this.setState({ newBoxDimensions });

    this.drawState = drawState.drawing;
  }

  onMouseMoveOnImage(event) {
    if (this.props.error) {
      return;
    }

    const mouseCoordinates = this.getImageMouseCoordinatesFromMouseEvent(event);

    switch (this.drawState) {
      case drawState.drawing:
        const newBoxDimensions = this.state.newBoxDimensions;

        newBoxDimensions.endX = mouseCoordinates.x;
        newBoxDimensions.endY = mouseCoordinates.y;

        this.setState({ newBoxDimensions });

        return;

      case drawState.resizing:
        const box = this.state.boxes[this.editingBoxIndex];

        box.endX = mouseCoordinates.x;
        box.endY = mouseCoordinates.y;

        const boxes = this.state.boxes;
        boxes[this.editingBoxIndex] = box;

        this.setState({ boxes });

        return;

      default: return;
    }
  }

  onMouseUpFromImage(event) {
    if (this.drawState !== drawState.drawing) {
      return;
    }

    const boxes = this.state.boxes;
    boxes.push(this.state.newBoxDimensions);
    this.setState({ boxes, newBoxDimensions: null });

    this.drawState = drawState.default;

    this.saveBoxes(boxes);
  }

  onMouseDownOnBox(event, boxIndex) {
    if (this.drawState !== drawState.default) {
      return;
    }

    event.stopPropagation();

    if (this.editingBoxIndex !== null) {
      return;
    }

    const mouseCoordinates = this.getImageMouseCoordinatesFromMouseEvent(event);

    const box = this.state.boxes[boxIndex];

    this.mouseBoxDeltaX = mouseCoordinates.x - box.startX;
    this.mouseBoxDeltaY = mouseCoordinates.y - box.startY;

    this.editingBoxIndex = boxIndex;

    this.drawState = drawState.moving;
  }

  onMouseMoveOnBox(event) {
    if (this.drawState !== drawState.moving) {
      return;
    }

    event.stopPropagation();

    const box = this.state.boxes[this.editingBoxIndex];

    const mouseCoordinates = this.getImageMouseCoordinatesFromMouseEvent(event);

    const startX = mouseCoordinates.x - this.mouseBoxDeltaX;
    const startY = mouseCoordinates.y - this.mouseBoxDeltaY;
    const endX = startX + (box.endX - box.startX);
    const endY = startY + (box.endY - box.startY);

    const boxes = this.state.boxes;
    boxes[this.editingBoxIndex] = { startX, startY, endX, endY };
    this.setState({ boxes });
  }

  onMouseUpFromBox(event) {
    if (this.drawState !== drawState.moving) {
      return;
    }

    if (this.isMovingBox) {
      event.stopPropagation();
    }

    this.mouseBoxDeltaX = 0;
    this.mouseBoxDeltaY = 0;

    this.editingBoxIndex = null;

    this.forceUpdate();

    this.drawState = drawState.default;

    this.saveBoxes(this.state.boxes);
  }

  onMouseDownOnResizer(event, index) {
    if(this.drawState !== drawState.default) {
      return;
    }

    event.stopPropagation();

    this.editingBoxIndex = index;

    this.drawState = drawState.resizing;
  }

  onMouseUpFromResizer(event) {
    if (this.drawState !== drawState.resizing) {
      return;
    }

    event.stopPropagation();

    this.editingBoxIndex = null;

    this.forceUpdate();

    this.drawState = drawState.default;

    this.saveBoxes(this.state.boxes);
  }

  getImageMouseCoordinatesFromMouseEvent(event) {
    const parentBoundingRect = this.imageElement.getBoundingClientRect();

    return {
      x: event.nativeEvent.pageX - parentBoundingRect.left - window.scrollX,
      y: event.nativeEvent.pageY - parentBoundingRect.top - window.scrollY,
    };
  }

  deleteBoxAtIndex(index) {
    const boxes = this.state.boxes;
    boxes.splice(index, 1);

    this.setState({ boxes });

    this.saveBoxes(boxes);
  }

  renderBox(dimensions, index = null, additionalClassName = '') {
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
      <div className={`Image__Box ${additionalClassName} ` + (index === this.editingBoxIndex ? `Image__Box--${this.drawState}` : '')}
           key={index}
           onMouseDown={e => this.onMouseDownOnBox(e, index)}
           onMouseMove={e => this.onMouseMoveOnBox(e)}
           onMouseUp={e => this.onMouseUpFromBox(e)}
           style={boxStyle}
      >
        <div className="Image__Box__DeleteButton"
             onClick={e => this.deleteBoxAtIndex(index)}
        />

        <div className="Image__Box__DragArea"
             onMouseDown={e => this.onMouseDownOnResizer(e, index)}
             onMouseMove={e => this.onMouseMoveOnImage(e)}
             onMouseUp={e => this.onMouseUpFromResizer(e)}
        />
      </div>
    );
  }

  renderImage() {
    return (
      <div className="Image__Image">
        <img
             role="presentation"
             src={this.props.url}
             ref={(img) => this.imageElement = img}
             draggable="false"
        />

        {this.state.newBoxDimensions !== null ? this.renderBox(this.state.newBoxDimensions, null, "Image___Box--Bordered") : ''}

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
           onMouseDown={e => this.onMouseDownOnImage(e)}
           onMouseMove={e => this.onMouseMoveOnImage(e)}
           onMouseUp={e => this.onMouseUpFromImage(e)}
      >
        { this.props.error ? this.renderError() : this.renderImage() }
      </div>
    );
  }
}
