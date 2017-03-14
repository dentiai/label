import React from 'react';
import './ShowLabels.css';

export default (props) => {
  const labels = props.labels || [];

  const renderLabel = (label, index) => (
    <li className="ShowLabels__Label" key={index}>{label}</li>
  );

  return (
    <ul className="ShowLabels">
      {labels.map(renderLabel)}
    </ul>
  );
};
