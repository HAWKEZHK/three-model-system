import React from 'react';
import ReactDOM from 'react-dom';

import { PageFrame } from '@/common/components';
import { Stage, Operation } from '@/components';

ReactDOM.render(
  <PageFrame siderComp={<Operation />} contentComp={<Stage />} />,
  document.getElementById('root') as HTMLElement,
);
