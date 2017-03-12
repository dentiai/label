import React, { Component } from 'react';
import axios from 'axios';
import Image from '../Image';
import { LABEL_CONFIG_FILE_URL } from '../../constants';
import { getBucketImageList, uploadJSONToBucket, downloadJSONFromBucket } from '../../util/io';
import { loadBoxes, loadLabelConfig } from '../../actions';
import { connect } from 'react-redux';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentImageUrl: null,
      currentImageIndex: 71,
      // currentImageIndex: 0,
      hasErroredOnLoad: false,
    }

    this.list = [];
  }

  componentDidMount() {
    getBucketImageList(list => {
      this.list = list;
      const url = this.list[this.state.currentImageIndex];
      this.setState({ currentImageUrl: url });
      this.checkUrl(url);
      this.loadImageBoxes(url);
    });

    downloadJSONFromBucket(LABEL_CONFIG_FILE_URL, (config) => {
      this.props.action.loadLabelConfig(config);
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

      this.loadImageBoxes(url);

  }

  /**
   * Load previous image in image list
   *
   * @return {void}
   */
  prevImage() {
    this.saveCurrentImage();

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
    this.saveCurrentImage();

    let imageIndex = this.state.currentImageIndex + 1;

    if (imageIndex === this.list.length) {
      imageIndex = 0;
    }

    this.setAndCheckImageAtIndex(imageIndex);
  }

  loadImageBoxes(url) {
    downloadJSONFromBucket(this.getJSONFileNameForImage(url), (boxes) => {
      this.props.action.loadBoxes(boxes);
    });
  }

  saveCurrentImage() {
    uploadJSONToBucket(
      this.getJSONFileNameForImage(this.state.currentImageUrl),
      this.props.image.boxes
    );
  }

  getJSONFileNameForImage(url) {
    return url.substring(url.lastIndexOf('/')+1) + ".json";
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

// ---
// --- Connect Redux
// ---
const mapStateToProps = (state) => ({
  image: state.image,
});

const mapDispatchToProps = (dispatch) => ({
  action: {
    loadLabelConfig: (config) => dispatch(loadLabelConfig(config)),
    loadBoxes: (boxes) => dispatch(loadBoxes(boxes)),
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
