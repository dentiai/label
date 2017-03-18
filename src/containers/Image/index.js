import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  drawNewBox,
  addNewBox,
  clearNewBox,
  updateBoxAtIndex,
  deleteBoxAtIndex,
} from '../../actions';
import EditLabels from '../EditLabels';
import ShowLabels from '../../components/ShowLabels';
import { MIN_BOX_WIDTH, MIN_BOX_HEIGHT } from '../../constants';
import './Image.css';

const drawState = {
  default:  'default',
  drawing:  'drawing',
  moving:   'moving',
  resizing: 'resizing',
};

const resizingDirection = {
  northWest: 'northWest',
  southEast: 'southEast',
};

class Image extends Component {

  constructor(props) {
    super(props);

    this.imageElement = null;

    this.drawState = drawState.default;

    this.resizingDirection = null;

    this.editingBoxIndex = null;

    this.mouseBoxDeltaX = 0;
    this.mouseBoxDeltaY = 0;

    this.state = {
      isEditingLabelsForBoxIndex: null,
    };
  }

  onMouseDownOnImage(event) {
    if (this.drawState !== drawState.default) {
      return;
    }

    const mouseCoordinates = this.getImageMouseCoordinatesFromMouseEvent(event);

    const startX = mouseCoordinates.x;
    const startY = mouseCoordinates.y;
    const endX = startX;
    const endY = startY;

    this.props.action.drawNewBox({ startX, startY, endX, endY });

    this.drawState = drawState.drawing;
  }

  onMouseMoveOnImage(event) {
    if (this.props.error) {
      return;
    }

    const mouseCoordinates = this.getImageMouseCoordinatesFromMouseEvent(event);

    switch (this.drawState) {
      case drawState.drawing:
        const newBox = this.props.image.newBox;

        newBox.endX = mouseCoordinates.x;
        newBox.endY = mouseCoordinates.y;

        this.props.action.drawNewBox(newBox);

        return;

      case drawState.resizing:
        this.resizeEditingBoxWithMouseCoordinates(mouseCoordinates);
        return;

      default: return;
    }
  }

  onMouseUpFromImage(event) {
    if (this.drawState !== drawState.drawing) {
      return;
    }

    this.drawState = drawState.default;

    const { startX, startY, endX, endY } = this.props.image.newBox;

    const newBoxWidth = endX - startX;
    const newBoxHeight = endY - startY;

    if (newBoxWidth < MIN_BOX_WIDTH || newBoxHeight < MIN_BOX_HEIGHT) {
      this.props.action.clearNewBox();
    } else {
      this.props.action.addNewBox();
    }
  }

  onMouseDownOnBox(event, index) {
    if (this.drawState !== drawState.default) {
      return;
    }

    event.stopPropagation();

    if (this.editingBoxIndex !== null) {
      return;
    }

    this.editingBoxIndex = index;

    const box = this.props.image.boxes[this.editingBoxIndex];

    const mouseCoordinates = this.getImageMouseCoordinatesFromMouseEvent(event);

    this.mouseBoxDeltaX = mouseCoordinates.x - box.startX;
    this.mouseBoxDeltaY = mouseCoordinates.y - box.startY;

    this.drawState = drawState.moving;
  }

  onMouseMoveOnBox(event) {
    if (this.drawState !== drawState.moving) {
      return;
    }

    event.stopPropagation();

    const box = this.props.image.boxes[this.editingBoxIndex];

    const mouseCoordinates = this.getImageMouseCoordinatesFromMouseEvent(event);

    const startX = mouseCoordinates.x - this.mouseBoxDeltaX;
    const startY = mouseCoordinates.y - this.mouseBoxDeltaY;
    const endX = startX + (box.endX - box.startX);
    const endY = startY + (box.endY - box.startY);

    this.props.action.updateBoxAtIndex(
      this.editingBoxIndex,
      { startX, startY, endX, endY }
    );
  }

  onMouseUpFromBox(event) {
    if (this.drawState !== drawState.moving) {
      return;
    }

    event.stopPropagation();

    this.resetEditingBox();

    this.forceUpdate();

    this.drawState = drawState.default;
  }

  onMouseDownOnResizer(event, index, resizingDirection) {
    if(this.drawState !== drawState.default) {
      return;
    }

    event.stopPropagation();

    this.editingBoxIndex = index;

    this.resizingDirection = resizingDirection;

    this.drawState = drawState.resizing;
  }

  onMouseUpFromResizer(event) {
    if (this.drawState !== drawState.resizing) {
      return;
    }

    event.stopPropagation();

    this.resetEditingBox();

    this.drawState = drawState.default;

    this.forceUpdate();
  }

  onClickAddEditButton(event, index) {
    this.setState(prevState => {
      let isEditingLabelsForBoxIndex =
        prevState.isEditingLabelsForBoxIndex === index ?
                                                  null :
                                                  index;

        return { isEditingLabelsForBoxIndex };
    });
  }

  resizeEditingBoxWithMouseCoordinates(mouseCoordinates) {
    if (this.resizingDirection === null) {
      return;
    }

    const box = this.props.image.boxes[this.editingBoxIndex];

    switch (this.resizingDirection) {
      case resizingDirection.northWest:
        box.startX = mouseCoordinates.x;
        box.startY = mouseCoordinates.y;

        break;

      case resizingDirection.southEast:
        box.endX = mouseCoordinates.x;
        box.endY = mouseCoordinates.y;

        break;

      default: return;
    }

    this.props.action.updateBoxAtIndex(this.editingBoxIndex, box);
  }

  getImageMouseCoordinatesFromMouseEvent(event) {
    const imageBoundingRect = this.imageElement.getBoundingClientRect();

    return {
      x: event.nativeEvent.pageX - imageBoundingRect.left - window.scrollX,
      y: event.nativeEvent.pageY - imageBoundingRect.top - window.scrollY,
    };
  }

  resetEditingBox() {
    this.editingBoxIndex = null;

    this.resizingDirection = null;

    this.mouseBoxDeltaX = null;
    this.mouseBoxDeltaY = null;
  }

  renderResizers(index) {
    return (
      <div className="ImageBox__Resizers">
        <div className="Image__Box__Resizer Image__Box__Resizer--NW"
             onMouseDown={e => this.onMouseDownOnResizer(e, index, resizingDirection.northWest)}
             onMouseMove={e => this.onMouseMoveOnImage(e)}
             onMouseUp={e => this.onMouseUpFromResizer(e)}
        />
        <div className="Image__Box__Resizer Image__Box__Resizer--SE"
             onMouseDown={e => this.onMouseDownOnResizer(e, index, resizingDirection.southEast)}
             onMouseMove={e => this.onMouseMoveOnImage(e)}
             onMouseUp={e => this.onMouseUpFromResizer(e)}
        />
      </div>
    );
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

    boxStyle.maxHeight = boxStyle.height;

    return (
      <div className={`Image__Box ${additionalClassName} ` + (index === this.editingBoxIndex ? `Image__Box--${this.drawState}` : '')}
           key={index}
           onMouseDown={e => this.onMouseDownOnBox(e, index)}
           onMouseMove={e => this.onMouseMoveOnBox(e)}
           onMouseUp={e => this.onMouseUpFromBox(e)}
           style={boxStyle}
      >
        <div className="Image__Box__DeleteButton"
             onClick={e => this.props.action.deleteBoxAtIndex(index)}
        />

        {this.renderResizers(index)}

        <div className="Image__Box__AddEditButton"
             onClick={e => this.onClickAddEditButton(e, index)}
        >
          +/-
        </div>

        {this.props.image.boxes[index] && this.state.isEditingLabelsForBoxIndex !== index &&
          <div className="Image__Box__ShowLabels">
            <ShowLabels labels={this.props.image.boxes[index].labels} />
          </div>
        }

        {this.props.image.boxes[index] && this.state.isEditingLabelsForBoxIndex === index &&
          <EditLabels
            boxIndex={index}
            activeLabels={this.props.image.boxes[index].labels}
          />
        }
      </div>
    );
  }

  renderImage() {
    return (
      <div className="Image__Image">
        <img
             role="presentation"
             src={this.props.url}
             ref={img => this.imageElement = img}
             draggable="false"
        />

        {this.props.image.newBox &&
          this.renderBox(this.props.image.newBox, null, "Image___Box--Bordered")}

        {this.props.image.boxes.map((dimensions, index) => this.renderBox(dimensions, index))}
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
        {this.props.error ? this.renderError() : this.renderImage() }
      </div>
    );
  }
}

// ---
// --- Connect Redux
// ---
const mapStateToProps = (state) => ({
  image: state.image,
});

const mapDispatchToProps = (dispatch) => ({
  action: {
    drawNewBox: (dimensions) => dispatch(drawNewBox(dimensions)),
    addNewBox: () => dispatch(addNewBox()),
    clearNewBox: () => dispatch(clearNewBox()),
    updateBoxAtIndex: (index, dimensions) => dispatch(updateBoxAtIndex(index, dimensions)),
    deleteBoxAtIndex: (index) => dispatch(deleteBoxAtIndex(index)),
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Image);
