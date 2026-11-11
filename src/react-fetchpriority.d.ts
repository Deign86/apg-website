// The <img> priority hint as React 18 renders it: the lowercase attribute passes through to the DOM, while the
// camelCase `fetchPriority` (React 19) is unknown to react-dom 18 and only warns.
import 'react';

declare module 'react' {
  interface ImgHTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}
