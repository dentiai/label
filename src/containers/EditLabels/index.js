import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  addLabelForBoxAtIndex,
  deleteLabelsForBoxAtIndex,
  toggleLabelForBoxAtIndex,
} from '../../actions';
import './EditLabels.css';

class Labels extends Component {
  addActiveLabel(label) {
    this.props.action.addLabelForBoxAtIndex(this.props.boxIndex, label);

    this.forceUpdate();
  }

  deleteGroupLabels(group) {
    this.props.action.deleteLabelsForBoxAtIndex(this.props.boxIndex, group.labels);

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

  onSelectChanged(event, group) {
    event.preventDefault();

    const selectedLabel = event.target.value;

    if (selectedLabel === '') {
      this.deleteGroupLabels(group);
    } else {
      this.addActiveLabel(selectedLabel);
    }
  }

  renderCheckboxLabel(label) {
    return (
      <div
        className="EditLabel"
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
      <div className="EditLabelsGroup EditLabelsGroup--isMutuallyExclusive">
        <select
            value={this.getSelectedInGroup(group)}
            onChange={e => this.onSelectChanged(e, group)}
        >
          <option value=""></option>

          {group.labels.map(label => (
            <option key={label} value={label}>{label}</option>
          ))};
        </select>
      </div>
    );
  }

  renderLabelGroups() {
    let renderedGroups = [];

    this.props.labels.config.groups.forEach((group, index) => {
      let item = null;

      if (group.areLabelsMutuallyExclusive) {
          item = this.renderSelectGroup(group);
      } else {
        item = group.labels.map(label => this.renderCheckboxLabel(label));
      }

      renderedGroups.push(<div key={group.id}>{item}</div>);
    });

    return renderedGroups;
  }

  render() {
    return (
      <div
        className={"EditLabels"}
          onMouseDown={e => e.stopPropagation()}
          onMouseMove={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
      >
        <div className="EditLabels__Groups">
          { this.renderLabelGroups() }
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
    toggleLabelForBoxAtIndex: (index, label) => dispatch(toggleLabelForBoxAtIndex(index, label)),
    addLabelForBoxAtIndex: (index, label) => dispatch(addLabelForBoxAtIndex(index, label)),
    deleteLabelsForBoxAtIndex: (index, labels) => dispatch(deleteLabelsForBoxAtIndex(index, labels)),
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Labels);
