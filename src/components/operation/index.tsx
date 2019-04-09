import React, { Component } from 'react';
import { Card, Tag } from 'antd';

import { IGeometrys } from '@/common/models';
import { GEOMETRYS } from '@/constants';
import styles from './index.less';

const { CheckableTag } = Tag;
const { container, card } = styles;

interface IProps {
  preType: IGeometrys | null; // 几何体类型
  setPreGeometry: (preType: IGeometrys | null) => void; // 设置几何体
}
export class Operation extends Component<IProps> {
  render() {
    const { preType, setPreGeometry } = this.props;
    return (
      <div className={container}>
        <Card className={card} title="基础几何体" size="small" bordered={false}>
          {GEOMETRYS.map(({ name, type }) => (
            <CheckableTag
              key={type}
              checked={type === preType}
              onChange={() => setPreGeometry(type)}
            >
              {name}
            </CheckableTag>
          ))}
        </Card>
      </div>
    );
  }
}
