import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  addLabelForBoxAtIndex,
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

  addActiveLabel(label) {
    this.props.action.addLabelForBoxAtIndex(this.props.boxIndex, label);

    this.forceUpdate();
  }

  toggleActiveLabel(label) {
    this.props.action.toggleLabelForBoxAtIndex(this.props.boxIndex, label);

    this.forceUpdate();
  }

  activeLabelsInclude(label) {
    return !!this.props.activeLabels &&
      this.props.activeLabels.indexOf(label) !== -1;
  }

  getSelectedInGroup(group) {
    let selected = '';

    group.labels.forEach(label => {
      if (this.activeLabelsInclude(label)) {
        selected = label;
      }
    });

    return selected;
  }

  onSelectChanged(event) {
    event.preventDefault();

    const selectedLabel = event.target.value;

    if (selectedLabel === '') {
      return;
    }

    this.addActiveLabel(selectedLabel);
  }

  renderActiveLabel(label) {
    return (
      <p className="Label" key={label}>
        {label}
      </p>
    );
  }

  renderCheckboxLabel(label) {
    return (
      <div
        className="Label"
        key={label}
      >
        <label>
          <input
            type="checkbox"
            checked={this.activeLabelsInclude(label)}
            onChange={e => this.toggleActiveLabel(label)}
          />

          {label}
        </label>
      </div>
    );
  }

  renderSelectGroup(group) {
    return (
      <div className="LabelGroup LabelGroup--isMutuallyExclusive">
        <select
            value={this.getSelectedInGroup(group)}
            onChange={e => this.onSelectChanged(e)}
        >
          <option value=""></option>

          {group.labels.map(label => (
            <option key={label} value={label}>{label}</option>
          ))};
        </select>
      </div>
    );
  }

  renderAvailableLabelGroups() {
    let renderedGroups = [];

    this.props.labels.config.groups.forEach((group, index) => {
      let item = null;

      if (group.areLabelsMutuallyExclusive) {
          item = this.renderSelectGroup(group);
      } else {
        item = group.labels.map(label => this.renderCheckboxLabel(label));
      }

      renderedGroups.push(<div key={index}>{item}</div>);
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
    addLabelForBoxAtIndex: (index, label) => dispatch(addLabelForBoxAtIndex(index, label)),
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Labels);
