import React, { Component } from 'react';
import './Image.css';

export default class Image extends Component {
  renderImage() {
    return (
      <img role="presentation" src={this.props.url} />
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
      <div className="Image">
        { this.props.error ? this.renderError() : this.renderImage() }
      </div>
    );
  }
}
