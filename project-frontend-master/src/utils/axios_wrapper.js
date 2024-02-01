import axios from 'axios';
import { ITERATION } from './constants';
import { PATHS } from './paths';

export const makeRequest = (method, path, options) => {
  if (ITERATION === 2) {
    if (PATHS[ITERATION][path] == null) {
      return Promise.reject(new Error("Don\'t worry - this is not part of iteration 2 so this error is expected"))
    }
    switch (method) {
      case 'GET':
        return axios.get(PATHS[ITERATION][path], { params: options });
      case 'POST':
        return axios.post(PATHS[ITERATION][path], options);
      case 'PUT':
        return axios.put(PATHS[ITERATION][path], options);
      case 'DELETE':
        return axios.delete(PATHS[ITERATION][path], { params: options });
      default:
        console.log('yikes');
    }
  } else if (ITERATION === 3) {
    const { token, ...others } = options;
    switch (method) {
      case 'GET':
        return axios.get(PATHS[ITERATION][path], {
          params: others,
          headers: { token },
        });
      case 'POST':
        return axios.post(PATHS[ITERATION][path], others, {
          headers: { token },
        });
      case 'PUT':
        return axios.put(PATHS[ITERATION][path], others, {
          headers: { token },
        });
      case 'DELETE':
        return axios.delete(PATHS[ITERATION][path], {
          params: others,
          headers: { token },
        });
      default:
        console.log('yikes');
    }
  }
};
