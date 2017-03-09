import React, { Component } from 'react';
import axios from 'axios';
import Image from '../Image';
import { getBucketImageList, downloadJSONFromBucket } from '../../util/io';
import { LABEL_CONFIG_FILE_URL } from '../../constants';
import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentImageUrl: null,
      currentImageIndex: 0,
      hasErroredOnLoad: false,
      labelConfig: null
    }

    this.list = [];

    getBucketImageList(list => {
      this.list = list;
      const url = this.list[this.state.currentImageIndex];
      this.setState({ currentImageUrl: url });
      this.checkUrl(url);
    });

    downloadJSONFromBucket(LABEL_CONFIG_FILE_URL, (labelConfig) => {
      this.setState({ labelConfig });
    });
  }

  /**
   * Check the URL given to make sure it loads without error
   *
   * @param {string} url
   * @return {void}
   */
  checkUrl(url) {
    axios
      .head(url)
      .then((response) => this.setState({ hasErroredOnLoad: false }))
      .catch((error) => this.setState({ hasErroredOnLoad: true }));
  }

  /**
   * Set the current image to be the one at the given index and check its
   * URL
   *
   * @param {number} index
   * @return {void}
   */
  setAndCheckImageAtIndex(index) {
      const url = this.list[index];

      this.setState({
        currentImageIndex: index,
        currentImageUrl: url,
      });

      this.checkUrl(url);
  }

  /**
   * Load previous image in image list
   *
   * @return {void}
   */
  prevImage() {
    let imageIndex = this.state.currentImageIndex - 1;

    if (imageIndex === -1) {
      imageIndex = this.list.length - 1;
    }

    this.setAndCheckImageAtIndex(imageIndex);
  }

  /**
   * Load next image in image list
   *
   * @return {void}
   */
  nextImage() {
    let imageIndex = this.state.currentImageIndex + 1;

    if (imageIndex === this.list.length) {
      imageIndex = 0;
    }

    this.setAndCheckImageAtIndex(imageIndex);
  }

  render() {
    return (
      <div className="App">
        <div onClick={() => this.prevImage()} className="App__NavButton App__NavButton--Prev">
          &larr;
        </div>
        <div onClick={() => this.nextImage()} className="App__NavButton App__NavButton--Next">
          &rarr;
        </div>

        {this.state.currentImageUrl &&
          <Image
            url={this.state.currentImageUrl}
            error={this.state.hasErroredOnLoad}
            labelConfig={this.state.labelConfig}
          />
        }
      </div>
    );
  }
}
