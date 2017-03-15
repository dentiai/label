import React, { Component } from 'react';
import axios from 'axios';
import Image from '../Image';
import Modal from 'simple-react-modal';
import {
  LABEL_CONFIG_FILE_URL,
  CHECK_IMAGE_DIRTY_INTERVAL,
  FLASH_ALERT_ONSCREEN_TIME
} from '../../constants';
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
      isCurrentImageClean: true,
      showModal: false,
      navAttempt: null,
      isSaving: false,
      isSaved: false,
    };

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

    setInterval(() => this.tick(), CHECK_IMAGE_DIRTY_INTERVAL);
  }

  /**
   * Check if image needs saving and update state
   *
   * @return {void}
   */
  tick() {
    this.setState((prevState) => ({ isCurrentImageClean: this.isCurrentImageClean() }));
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
    this.props.action.clearImage();

    const url = this.list[index];

    this.setState({
      currentImageIndex: index,
      currentImageUrl: url,
      showModal: false,
      navAttempt: null,
    });

    this.checkUrl(url);

    this.loadImageBoxes(url);
  }

  /**
   * Load previous image in image list
   *
   * @param {boolean} force
   * @return {void}
   */
  prevImage(force = false) {
    if (!force && this.isCurrentImageDirty()) {
      this.setState({ showModal: true, navAttempt: this.prevImage.bind(this) });
      return;
    }

    let imageIndex = this.state.currentImageIndex - 1;

    if (imageIndex === -1) {
      imageIndex = this.list.length - 1;
    }

    this.setAndCheckImageAtIndex(imageIndex);
  }

  /**
   * Load next image in image list
   *
   * @param {boolean} [force]
   * @return {void}
   */
  nextImage(force = false) {
    if (!force && this.isCurrentImageDirty()) {
      this.setState({ showModal: true, navAttempt: this.nextImage.bind(this) });
      return;
    }

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
        this.props.action.loadImage(data.currentBoxes, data.history);
      },
      (error) => {
        console.log(error);

        this.props.action.clearImage();
      }
    );
  }

  saveCurrentImage() {
    if (this.isCurrentImageClean()) {
      return;
    }

    this.setState({ isSaving: true });

    const currentBoxes = this.props.image.boxes;
    const prevBoxes = this.props.image.prevBoxes;

    const history = this.props.image.history || {};

    if (prevBoxes) {
      const timestamp = (new Date()).valueOf();

      history[timestamp] = prevBoxes;
    }

    uploadJSONToBucket(
      this.getJSONFileNameForImage(this.state.currentImageUrl),
      { currentBoxes, history },
      () => {
        this.setState({ isSaved: true });

        setTimeout(() => {
          this.setState({ isSaving: false, isSaved: false, isCurrentImageClean: true });

          this.props.action.loadImage(currentBoxes, history);
        }, FLASH_ALERT_ONSCREEN_TIME);
      }
    );
  }

  isCurrentImageClean() {
    const { prevBoxes, boxes } = this.props.image;

    return JSON.stringify(prevBoxes) === JSON.stringify(boxes);
  }

  isCurrentImageDirty() {
    return !this.isCurrentImageClean();
  }

  getJSONFileNameForImage(url) {
    return url.substring(url.lastIndexOf('/')+1) + ".json";
  }

  handleModalConfirmation(event) {
    this.state.navAttempt(true);
  }

  handlModalCancellation(event) {
    this.setState({
      showModal: false,
      navAttempt: null,
    });
  }

  render() {
    return (
      <div className="App">
        <Modal show={this.state.showModal} containerStyle={{borderRadius: "4px"}}>
          <div className="App__ModalContent">
            <p>This image has unsaved changes. Are you sure you want to navigate away?</p>

            <button onClick={e => this.handleModalConfirmation(e)}>Yes</button>
            &nbsp;
            <button onClick={e => this.handlModalCancellation(e)}>Cancel, stay a while</button>
          </div>
        </Modal>

        <div className="App__ControlBar">
          <button
            onClick={() => this.prevImage()}
            className="App__NavButton App__NavButton--Prev"
            disabled={this.state.isSaving}
          >
            &larr;
          </button>

          <button
            onClick={() => this.nextImage()}
            className="App__NavButton App__NavButton--Next"
            disabled={this.state.isSaving}
          >
            &rarr;
          </button>

          <button
            className="App__SaveButton"
            disabled={this.state.isCurrentImageClean}
            onClick={e => this.saveCurrentImage()}
          >
            {this.state.isSaved && '👌 All done'}

            {!this.state.isSaved && (this.state.isSaving ? 'Saving...': 'Save image')}
          </button>
        </div>

      <div className="App__Image">
        {this.state.currentImageUrl &&
          <Image
            url={this.state.currentImageUrl}
            error={this.state.hasErroredOnLoad}
          />
        }</div>
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
