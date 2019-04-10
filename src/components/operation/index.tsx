import React, { Component } from 'react';
import { Card, Tag } from 'antd';
import DatGui, * as ReactDatGui from 'react-dat-gui';

import { IGeometrys, IParams } from '@/common/models';
import { GEOMETRYS, MAX_SIZE, STEP } from '@/constants';

import styles from './index.less';
import 'react-dat-gui/build/react-dat-gui.css';

const { DatNumber } = ReactDatGui;

const { CheckableTag } = Tag;
const { container, card, gui } = styles;

interface IProps {
  preType: IGeometrys | null; // 几何体类型
  prePos: { x: number, y: number, z: number }; // 预览几何体位置
  preParams: IParams['DEFAULT'] | IParams[IGeometrys]; // 预览几何体参数
  setPreGeometry: (preType: IGeometrys | null) => void; // 设置几何体
  updatePrePos: ({ x, y, z }: IProps['prePos']) => void;
  updatePreParams: (params: IParams[IGeometrys]) => void;
  preToEntity: () => void;
}
export class Operation extends Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }
  render() {
    const { preType, prePos, preParams, setPreGeometry, updatePrePos, updatePreParams, preToEntity } = this.props;
    const preItem = GEOMETRYS.filter(({ type }) => type === preType)[0];
    const preName = preItem ? preItem.name : '未选中几何体';
    return (
      <div className={container}>
        <Card className={card} size="small" bordered={false} title="基础几何体">
          {GEOMETRYS.map(({ name, type }) => (
            <CheckableTag key={type} checked={type === preType} onChange={() => setPreGeometry(type)}>
              {name}
            </CheckableTag>
          ))}
        </Card>
        <Card
          className={card}
          size="small"
          bordered={false}
          title={`位置信息-${preName}`}
          extra={<a href="javascript:;" onClick={preToEntity}>保存</a>}
        >
          <DatGui className={gui} data={prePos} onUpdate={updatePrePos}>
            <DatNumber path="x" label="x" min={-MAX_SIZE} max={MAX_SIZE} step={STEP / 4} />
            <DatNumber path="y" label="y" min={-MAX_SIZE} max={MAX_SIZE} step={STEP / 4} />
            <DatNumber path="z" label="z" min={-MAX_SIZE} max={MAX_SIZE} step={STEP / 4} />
          </DatGui>
        </Card>
        <Card
          className={card}
          size="small"
          bordered={false}
          title={`几何信息-${preName}`}
          extra={<a href="javascript:;" onClick={preToEntity}>保存</a>}
        >
          <DatGui className={gui} data={preParams} onUpdate={updatePreParams}>
            {Object.keys(preParams).map(
              name => <DatNumber key={name} path={name} label={name} min={0} max={MAX_SIZE} step={STEP / 4} />
            )}
          </DatGui>
        </Card>
      </div>
    );
  }
}
