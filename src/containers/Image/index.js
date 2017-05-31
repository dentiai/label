import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import {
  drawNewBox,
  addNewBox,
  clearNewBox,
  updateBoxAtIndex,
  deleteBoxAtIndex
} from '../../actions';
import EditLabels from '../EditLabels';
import ShowLabels from '../../components/ShowLabels';
import { MIN_BOX_WIDTH, MIN_BOX_HEIGHT } from '../../constants';
import './Image.css';

const drawState = {
  default: 'default',
  drawing: 'drawing',
  moving: 'moving',
  resizing: 'resizing'
};

const resizingDirection = {
  northWest: 'northWest',
  southEast: 'southEast'
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
    this.labelList = [];
    this.state = {
      isEditingLabelsForBoxIndex: null
    };
  }

  onMouseDownOnImage(event) {
    this.setState({ clikedImage: null });
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

  setActiveLabel = mouseCoordinates => {
    const indexesOfHoveredLabel = _.filter(
      this.labelList,
      item =>
        item.startX <= mouseCoordinates.x &&
        item.endX >= mouseCoordinates.x &&
        item.startY <= mouseCoordinates.y &&
        item.endY >= mouseCoordinates.y
    );
    const currentActiveLabel = () => {
      if (indexesOfHoveredLabel.length > 0) {
        return indexesOfHoveredLabel.reduce((prev, curr) => {
          if (
            curr.endX < prev.endX &&
            curr.endY < prev.endY &&
            curr.startX > prev.startX &&
            curr.startY > prev.startY
          ) {
            return curr;
          } else if (
            curr.endX > prev.endX &&
            curr.endY > prev.endY &&
            curr.startX < prev.startX &&
            curr.startY < prev.startY
          ) {
            return prev;
          } else {
            return Math.abs(curr.centerPointX - mouseCoordinates.x) <
              Math.abs(prev.centerPointX - mouseCoordinates.x) &&
              Math.abs(curr.centerPointY - mouseCoordinates.y) <
                Math.abs(prev.centerPointY - mouseCoordinates.y)
              ? curr
              : prev;
          }
        }).id;
      }
    };
    if (this.state.singleActiveLabel !== currentActiveLabel())
      this.setState({ singleActiveLabel: currentActiveLabel() });
  };
  onMouseMoveOnImage(event) {
    if (this.props.error) {
      return;
    }

    const mouseCoordinates = this.getImageMouseCoordinatesFromMouseEvent(event);
    this.setActiveLabel(mouseCoordinates);

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

      default:
        return;
    }
  }

  onMouseUpFromImage(event) {
    if (this.drawState !== drawState.drawing) {
      return;
    }

    this.drawState = drawState.default;

    const boxStyle = this.getCSSForBoxWithDimensions(this.props.image.newBox);

    if (boxStyle.width < MIN_BOX_WIDTH || boxStyle.height < MIN_BOX_HEIGHT) {
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

    this.props.action.updateBoxAtIndex(this.editingBoxIndex, {
      startX,
      startY,
      endX,
      endY
    });
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
    if (this.drawState !== drawState.default) {
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
    event.stopPropagation();
    if (event.nativeEvent.which === 1) {
      this.setState(prevState => {
        let isEditingLabelsForBoxIndex = prevState.isEditingLabelsForBoxIndex ===
          index
          ? null
          : index;

        return { isEditingLabelsForBoxIndex };
      });
    }
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

      default:
        return;
    }

    // don't cross the streams! (prevent resizing past box edges)
    if (box.startX >= box.endX || box.startY >= box.endY) {
      return;
    }

    this.props.action.updateBoxAtIndex(this.editingBoxIndex, box);
  }

  getImageMouseCoordinatesFromMouseEvent(event) {
    const imageBoundingRect = this.imageElement.getBoundingClientRect();

    return {
      x: event.nativeEvent.pageX - imageBoundingRect.left - window.scrollX,
      y: event.nativeEvent.pageY - imageBoundingRect.top - window.scrollY
    };
  }

  getCSSForBoxWithDimensions(dimensions) {
    const boxStyle = {};

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

    return boxStyle;
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
        <div
          className="Image__Box__Resizer Image__Box__Resizer--NW"
          onMouseDown={e =>
            this.onMouseDownOnResizer(e, index, resizingDirection.northWest)}
          onMouseMove={e => this.onMouseMoveOnImage(e)}
          onMouseUp={e => this.onMouseUpFromResizer(e)}
        />
        <div
          className="Image__Box__Resizer Image__Box__Resizer--SE"
          onMouseDown={e =>
            this.onMouseDownOnResizer(e, index, resizingDirection.southEast)}
          onMouseMove={e => this.onMouseMoveOnImage(e)}
          onMouseUp={e => this.onMouseUpFromResizer(e)}
        />
      </div>
    );
  }

  toggleImageClass = val => {
    this.setState(prevState => {
      return {
        clikedImage: val,
        isEditingLabelsForBoxIndex: prevState.isEditingLabelsForBoxIndex === val
          ? val
          : null
      };
    });
  };
  renderBox(dimensions, index = null, additionalClassName = '') {
    const boxStyle = this.getCSSForBoxWithDimensions(dimensions);

    return (
      <div
        className={
          `${this.props.freezeLabels ? 'freeze' : ''} Image__Box number-${index} ${this.state.singleActiveLabel === index ? 'Image__Box-active' : ''} ${this.state.clikedImage === index ? 'clicked' : ''} ${additionalClassName} ` +
            (index === this.editingBoxIndex
              ? `Image__Box--${this.drawState}`
              : '')
        }
        key={index}
        onClick={() => !this.props.freezeLabels && this.toggleImageClass(index)}
        onMouseDown={e =>
          !this.props.freezeLabels && this.onMouseDownOnBox(e, index)}
        onMouseMove={e => !this.props.freezeLabels && this.onMouseMoveOnBox(e)}
        onMouseUp={e => !this.props.freezeLabels && this.onMouseUpFromBox(e)}
        style={boxStyle}
      >
        <div
          className="Image__Box__DeleteButton"
          onClick={e => this.props.action.deleteBoxAtIndex(index)}
          onMouseDown={e => e.stopPropagation()}
          onMouseMove={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
        />

        {this.renderResizers(index)}

        <div
          className="Image__Box__AddEditButton"
          onClick={e => this.onClickAddEditButton(e, index)}
          onMouseDown={e => e.stopPropagation()}
          onMouseMove={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
        >
          +/-
        </div>

        {this.props.image.boxes[index] &&
          this.state.isEditingLabelsForBoxIndex !== index &&
          <div className="Image__Box__ShowLabels">
            <ShowLabels labels={this.props.image.boxes[index].labels} />
          </div>}

        {this.props.image.boxes[index] &&
          this.state.isEditingLabelsForBoxIndex === index &&
          <EditLabels
            boxIndex={index}
            activeLabels={this.props.image.boxes[index].labels}
          />}
      </div>
    );
  }

  renderImage() {
    return (
      <div className={`Image__Image ${this.props.showLabels ? '' : 'hidden'}`}>
        <img
          role="presentation"
          src={this.props.url}
          ref={img => (this.imageElement = img)}
          draggable="false"
        />

        {this.props.image.newBox &&
          this.renderBox(
            this.props.image.newBox,
            null,
            'Image___Box--Bordered'
          )}

        {this.props.image.boxes.map((dimensions, index) =>
          this.renderBox(dimensions, index)
        )}
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
  componentWillUpdate(nextProps) {
    this.labelList = Array.from(nextProps.image.boxes).map((item, index) => ({
      ...item,
      id: index,
      centerPointX: (item.endX + item.startX) / 2,
      centerPointY: (item.startY + item.endY) / 2
    }));
  }
  render() {
    return (
      <div
        className="Image"
        onMouseDown={e => this.onMouseDownOnImage(e)}
        onMouseMove={e => this.onMouseMoveOnImage(e)}
        onMouseUp={e => this.onMouseUpFromImage(e)}
      >
        {this.props.error ? this.renderError() : this.renderImage()}
      </div>
    );
  }
}

// ---
// --- Connect Redux
// ---
const mapStateToProps = state => ({
  image: state.image
});

const mapDispatchToProps = dispatch => ({
  action: {
    drawNewBox: dimensions => dispatch(drawNewBox(dimensions)),
    addNewBox: () => dispatch(addNewBox()),
    clearNewBox: () => dispatch(clearNewBox()),
    updateBoxAtIndex: (index, dimensions) =>
      dispatch(updateBoxAtIndex(index, dimensions)),
    deleteBoxAtIndex: index => dispatch(deleteBoxAtIndex(index))
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Image);
