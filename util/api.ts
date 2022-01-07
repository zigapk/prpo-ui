import axios from 'axios';
import { makeUseAxios } from 'axios-hooks';
import Router from 'next/router';
import { clearUserInfo, getToken } from '../contexts/auth';

const API = process.env.NEXT_PUBLIC_HOST;
export const unknownApiError = 'unknown';

const publicAxios = axios.create({
  baseURL: API,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const privateAxios = axios.create({
  baseURL: API,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

privateAxios.interceptors.request.use(
    (config) => {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${getToken()}`;
        return config;
      } else {
        return Promise.reject('No HTTP headers');
      }
    },
    (error) => {
      return Promise.reject(error);
    },
);

privateAxios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const code = error && error.response ? error.response.status : 0;
      if (code === 401 || code === 403) {
        // Request is unauthorized. Clear local user info
        // (user's auth token is probably already invalid, no need to logout user)
        clearUserInfo();

        // Redirect user to / (if we aren't already there)
        // (do not redirect on actions pages)
        if (Router.route !== '/' && !Router.route.startsWith('/actions/')) {
          Router.push('/').then();
        }
      }
      return Promise.reject(error);
    },
);

const handleApiError = (reason: { response: Record<string, any> }, enqueueSnackbar: ((arg0: string) => void)): void => {
  if (reason.response?.status === 401 || reason.response?.status === 403) {
    // Request is unauthorized. Clear local user info
    // (user's auth token is probably already invalid, no need to logout user)
    clearUserInfo();
    // Redirect user to / (if we aren't already there)
    // (do not redirect on actions pages)
    Router.push('/auth/sign_in').then();
  } else if (reason.response?.status === 404) {
    enqueueSnackbar('Something went wrong.');
    return;
  } else {
    const code = reason.response?.data?.error ?? unknownApiError;
    enqueueSnackbar('Something went wrong.');
  }
};

const useAxios = makeUseAxios({
  axios: privateAxios,
  defaultOptions: {manual: false, useCache: true, ssr: false},
});

const usePublicAxios = makeUseAxios({
  axios: publicAxios,
  defaultOptions: {manual: false, useCache: true, ssr: false},
});

export { privateAxios, publicAxios, usePublicAxios, useAxios, handleApiError, API };