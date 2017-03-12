import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  toggleLabelForBoxAtIndex,
} from '../../actions';
import './Labels.css';

class Labels extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
    };
  }

  toggleActiveLabel(label) {
    this.props.action.toggleLabelForBoxAtIndex(this.props.boxIndex, label);

    this.forceUpdate();
  }

  renderActiveLabel(label) {
    return (
      <p className="Label" key={label}>
        {label}
      </p>
    );
  }

  renderAvailableLabel(label) {
    let isChecked = !!this.props.activeLabels &&
                    this.props.activeLabels.indexOf(label) !== -1;

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

  renderAvailableLabelGroups() {
    let renderedGroups = [];

    this.props.labels.config.groups.forEach(group => {
      renderedGroups.push(group.labels.map(label => this.renderAvailableLabel(label)));
    });

    return renderedGroups;
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
                { this.renderAvailableLabelGroups() }
              </div>
            </div>
          }

          { !this.state.isEditing && this.props.labels.activeLabels > 0 &&
              <div className="Labels__LabelList">
                {this.props.activeLabels &&
                  this.props.activeLabels.map(label => this.renderActiveLabel(label))}
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

// ---
// --- Connect Redux
// ---
const mapStateToProps = (state) => ({
  labels: state.labels,
});

const mapDispatchToProps = (dispatch) => ({
  action: {
    toggleLabelForBoxAtIndex: (index, labels) => dispatch(toggleLabelForBoxAtIndex(index, labels)),
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Labels);
