import {qs} from './util/helpers';

export const BASE_S3_BUCKET_URL = 'https://s3-eu-west-1.amazonaws.com/';

export const IMAGES_URL = qs['images'] || 'd-pan1';

export const S3_BUCKET_URL = BASE_S3_BUCKET_URL + IMAGES_URL;

export const APP_URL = BASE_S3_BUCKET_URL + 'd-pan1/label';

export const LABEL_CONFIG_FILE_URL = APP_URL + '/config/label-config.json';

// in milliseconds
export const CHECK_IMAGE_DIRTY_INTERVAL = 500;

// in milliseconds
export const FLASH_ALERT_ONSCREEN_TIME = 1000;

// in pixels
export const MIN_BOX_WIDTH = 5;
export const MIN_BOX_HEIGHT = 5;
