import React, { Component } from 'react';
import { Card, Tag } from 'antd';
import { Mesh } from 'three';

import { IGeometrys } from '@/common/models';
import { GEOMETRYS } from '@/constants';
import { createTypeGeometry } from '@/common/helpers';
import styles from './index.less';

const { CheckableTag } = Tag;
const { container, card } = styles;

interface IProps {
  addGeometry: (geometry: Mesh) => void;
}
interface IState {
  geometryType: IGeometrys;
}
export class Operation extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      geometryType: 'cube',
    };
  }
  render() {
    const { geometryType } = this.state;
    return (
      <div className={container}>
        <Card className={card} title="基础几何体" size="small" bordered={false}>
          {GEOMETRYS.map(({ name, type }) => (
            <CheckableTag
              key={type}
              checked={type === geometryType}
              onChange={() => this.handleTypeChange(type)}
            >
              {name}
            </CheckableTag>
          ))}
        </Card>
      </div>
    );
  }

  private handleTypeChange = (geometryType: IGeometrys) => {
    const { addGeometry } = this.props;
    addGeometry(createTypeGeometry(geometryType, true));
    this.setState({ geometryType });
  }
}
