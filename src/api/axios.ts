import _axios from 'axios';
import { config } from '@/config';

export const axios = _axios.create({
  baseURL: config.api.url,
  withCredentials: true,
});
