import React, { Component } from 'react';
import axios from 'axios';
import Image from '../Image';
import { LABEL_CONFIG_FILE_URL } from '../../constants';
import { getBucketImageList, uploadJSONToBucket, downloadJSONFromBucket } from '../../util/io';
import { loadImage, clearImage, loadLabelConfig } from '../../actions';
import { connect } from 'react-redux';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentImageUrl: null,
      currentImageIndex: 0,
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
    downloadJSONFromBucket(
      this.getJSONFileNameForImage(url),
      (data) => {
        this.props.action.clearImage();

        this.props.action.loadImage(data.currentBoxes, data.history);
      },
      (error) => {
        console.log(error);
        
        this.props.action.clearImage();
      }
    );
  }

  saveCurrentImage() {
    const currentBoxes = this.props.image.boxes;
    const prevBoxes = this.props.image.prevBoxes;

    if (JSON.stringify(prevBoxes) === JSON.stringify(currentBoxes)) {
      return;
    }

    const history = this.props.image.history || {};

    if (prevBoxes) {
      const timestamp = (new Date()).valueOf();

      history[timestamp] = prevBoxes;
    }

    uploadJSONToBucket(
      this.getJSONFileNameForImage(this.state.currentImageUrl),
      { currentBoxes, history }
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
    loadImage: (boxes, history) => dispatch(loadImage(boxes, history)),
    clearImage: (boxes) => dispatch(clearImage(boxes)),
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
