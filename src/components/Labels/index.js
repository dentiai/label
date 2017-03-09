import React, { Component } from 'react';
import './Labels.css';

export default class Labels extends Component {
  constructor(props) {
    super(props);

    this.availableLabels = [];

    this.props.config.groups.forEach(group => {
      group.labels.forEach(label => this.availableLabels.push(label));
    });

    let savedLabels = this.props.savedLabels && this.props.savedLabels.slice();

    this.state = {
      isEditing: false,
      activeLabels: savedLabels || [],
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.savedLabels !== undefined &&
        JSON.stringify(prevProps.savedLabels) !== JSON.stringify(this.props.savedLabels)) {
      this.setState({ activeLabels: this.props.savedLabels.slice() });
    }
  }

  toggleActiveLabel(label) {
    // we add the label to the active labels list if it isn't already there.
    // if it is there, we remove it.
    const activeLabels = this.state.activeLabels;
    const labelIndex = activeLabels.indexOf(label);

    if (labelIndex !== -1) {
      activeLabels.splice(labelIndex, 1);
    } else {
      activeLabels.push(label);
    }

    this.setState({ activeLabels });
  }

  onSavePressed() {
    this.setState({ isEditing: false });

    this.props.onSavePressed(this.state.activeLabels);
  }

  renderActiveLabel(label) {
    return (
      <p className="Label" key={label}>
        {label}
      </p>
    );
  }

  renderAvailableLabel(label) {
    let isChecked = this.state.activeLabels.indexOf(label) !== -1;

    return (
      <div
        className="Label"
        key={label}
      >
        <label>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={e => this.toggleActiveLabel(label)}
          />

          {label}
        </label>
      </div>
    );
  }

  render() {
    return (
      <div
          className={"Labels " + (this.state.isEditing && "Labels--isEditing")}
          onMouseDown={e => e.stopPropagation()}
          onMouseMove={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
      >
        <div className="Labels__LabelListWrapper">
          {this.state.isEditing &&
            <div>
              <div className="Labels__LabelList">
                {this.availableLabels.map(label => this.renderAvailableLabel(label))}
              </div>

              <div className="Labels__EditButtons">
                <button onClick={e => this.onSavePressed()}>Save</button>
                <button>Cancel</button>
              </div>
            </div>
          }

          { !this.state.isEditing && this.state.activeLabels.length > 0 &&
              <div className="Labels__LabelList">
                {this.state.activeLabels.map(label => this.renderActiveLabel(label))}
              </div>
          }

          { !this.state.isEditing &&
            <button
              className="Labels__AddEditButton"
              onClick={e => this.setState({ isEditing: true })}
            >
              +/-
            </button>
          }
        </div>
      </div>
    );
  }
}
