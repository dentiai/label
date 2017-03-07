import axios from 'axios';
import { parseString } from 'xml2js';
import { S3_BUCKET_URL } from '../constants';

/**
 * Generates an array of image object URLs from our S3 Bucket representation.
 *
 * @param {object} xml2js AWS S3 bucket object representation
 * @return {array}
 */
const extractImageListFromBucket = (bucket) => {
  const list = [];
  const bucketContents = bucket.ListBucketResult.Contents;

  bucketContents.forEach((object) => {
    const fileName = object.Key[0];

    // filter out everything except web images
    if (/\.(gif|jpg|jpeg|png|bmp)$/.test(fileName)) {
      list.push(`${S3_BUCKET_URL}/${fileName}`);
    }
  });

  return list;
}

/**
 * Retrieves a list of objects within our AWS S3 bucket.
 *
 * @param {function} onListReady(list) called when the list (array) is ready
 * @return {void}
 */
const getBucketImageList = (onListReady) => {
  axios.get(`${S3_BUCKET_URL}/?list-type=2`)
    .then((response) => {
      parseString(response.data, (error, result) => {
        if (error) {
          alert(error);
        } else {
          onListReady(extractImageListFromBucket(result));
        }
      });
    })
    .catch((error) => alert(error));
};

export default getBucketImageList;
