declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.module.css';
declare module '*.module.scss';
declare module '*.module.sass';

import 'axios';
declare module 'axios' {
  export interface AxiosResponse<T = any> {
    data: T;
  }
}
