import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'antd';

import styles from './index.less';

const { init } = styles;

ReactDOM.render(
  <div className={init}>
    init
    <Button type="primary">init</Button>
  </div>,
  document.getElementById('root') as HTMLElement,
);
