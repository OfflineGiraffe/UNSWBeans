require('dotenv').config();

let port = '0';
let deployedUrl = 'https://example.alwaysdata.net';
if (window.BACKEND_PORT !== undefined) {
  port = window.BACKEND_PORT;
  deployedUrl = window.DEPLOYED_URL;
} else {
  port = process.env.REACT_APP_BACKEND_PORT;
}
export const url = port === '0' || port === undefined ? deployedUrl : 'http://localhost:' + port;

export const drawerWidth = 240;
export const PERMISSION_IDS = {
  OWNER: 1,
  MEMBER: 2,
};
export const PAGINATION_SIZE = 50;
export const SLICE_SIZE = 10;

let iterationBlah;
if (window.ITERATION !== undefined) {
  iterationBlah = parseInt(window.ITERATION);
} else {
  iterationBlah = parseInt(process.env.REACT_APP_ITERATION);
}

export const ITERATION = iterationBlah;

console.log('Using backend at', url);
console.log('Running frontend for iteration', ITERATION);
