import React, { ReactElement } from 'react';
import { Layout } from 'antd';

import styles from './index.less';

const { sider, content } = styles;
const { Content, Sider } = Layout;

interface IProps {
  contentComp: ReactElement;
  siderComp: ReactElement;
}
export const PageFrame = ({ contentComp, siderComp }: IProps) => (
  <Layout>
    <Layout>
      <Content className={content}>
        {contentComp}
      </Content>
    </Layout>
    <Sider className={sider} width="300">
      {siderComp}
    </Sider>
  </Layout>
);
