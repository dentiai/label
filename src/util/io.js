import axios from 'axios';
import { S3_BUCKET_URL } from '../constants';

/**
 * Uploads the given JSON as a file to our S3 bucket
 *
 * @param {string} fileName
 * @param {string} json
 * @param {function} onUploaded
 */
export const uploadJSONToBucket = (fileName, json, onUploaded) => {
  const fileContents = JSON.stringify(json);

  const blob = new Blob([fileContents], {type: "application/json"});

  axios.put(`${S3_BUCKET_URL}/${fileName}`, blob, {
    header: {
      "Content-Type": "application/json",
    }
  })
  .then((response) => typeof onUploaded === "function" && onUploaded())
  .catch((error) => alert(error));
};

/**
 * Downloads given file from our S3 bucket
 *
 * @param {string} fileName
 * @param {function} onDownloaded
 */
export const downloadJSONFromBucket = (fileName, onDownloaded) => {
  axios.get(`${S3_BUCKET_URL}/${fileName}`)
       .then((response) => typeof onDownloaded === "function" && onDownloaded(response.data))
       .catch((error) => console.log(error));
};
