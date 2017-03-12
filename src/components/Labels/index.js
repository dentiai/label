import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateBoxLabelsAtBoxIndex, loadActiveLabels } from '../../actions';
import './Labels.css';

class Labels extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
    };
  }

  renderActiveLabel(label) {
    return (
      <p className="Label" key={label}>
        {label}
      </p>
    );
  }

  renderAvailableLabel(label) {
    let isChecked = this.props.activeLabels.indexOf(label) !== -1;

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

    this.props.availableLabelGroups.forEach(group => {
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

          { !this.state.isEditing && this.props.activeLabels > 0 &&
              <div className="Labels__LabelList">
                {this.props.activeLabels.map(label => this.renderActiveLabel(label))}
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
    activeLabels: state.labels.activeLabels,
    availableLabelGroups: state.labels.config.groups,
});

const mapDispatchToProps = (dispatch) => ({
  action: {
    updateBoxLabelsAtBoxIndex: (index, labels) => dispatch(updateBoxLabelsAtBoxIndex(index, labels)),
    loadActiveLabels: (activeLabels) => dispatch(updateBoxLabelsAtBoxIndex(activeLabels)),
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Labels);
