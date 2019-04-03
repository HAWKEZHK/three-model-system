import React from 'react';
import ReactDOM from 'react-dom';

import styles from './index.less';

const { init } = styles;

ReactDOM.render(
  <div className={init}>init</div>,
  document.getElementById('root') as HTMLElement,
);
