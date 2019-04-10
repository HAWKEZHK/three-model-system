import React, { Component } from 'react';
import { Card, Tag } from 'antd';

import { IGeometrys } from '@/common/models';
import { GEOMETRYS } from '@/constants';
import styles from './index.less';

import DatGui, * as ReactDatGui from 'react-dat-gui';
import 'react-dat-gui/build/react-dat-gui.css';

const { DatBoolean, DatColor, DatNumber, DatString } = ReactDatGui;

const { CheckableTag } = Tag;
const { container, card, gui } = styles;

interface IProps {
  preType: IGeometrys | null; // 几何体类型
  setPreGeometry: (preType: IGeometrys | null) => void; // 设置几何体
}
export class Operation extends Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }
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
        <Card className={card} title="参数控制" size="small" bordered={false}>
          <DatGui className={gui} data={{
            package: 'react-dat-gui',
            power: 9000,
            isAwesome: true,
            feelsLike: '#2FA1D6',
          }} onUpdate={console.info}>
            <DatString path="package" label="Package" />
            <DatNumber path="power" label="Power" min={9000} max={9999} step={1} />
            <DatBoolean path="isAwesome" label="Awesome?" />
            <DatColor path="feelsLike" label="Feels Like" />
          </DatGui>
        </Card>
      </div>
    );
  }
}
