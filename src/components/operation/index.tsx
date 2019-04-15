import React, { Component } from 'react';
import { Card, Tag, Icon } from 'antd';
import DatGui, * as ReactDatGui from 'react-dat-gui';

import { IGeometrys, IParams, ICommon } from '@/common/models';
import { GEOMETRYS, MAX_SIZE, STEP } from '@/common/constants';

import styles from './index.less';
import 'react-dat-gui/build/react-dat-gui.css';

const { DatNumber } = ReactDatGui;

const { CheckableTag } = Tag;
const { container, card, gui } = styles;

interface IProps extends ICommon {
  updatePrePos: ({ x, y, z }: IProps['prePos']) => void; // 设置预览几何体位置
  updatePreRotate: ({ x, y, z }: IProps['preRotate']) => void; // 设置预览几何体位置
  updatePreParams: (params: IParams[IGeometrys]) => void; // 设置预览几何体参数
  setPreGeometry: (preType: IGeometrys | null) => void; // 生成指定预览几何体
  preToEntity: () => void; // 将预览几何体转为实体
  lockMove: () => void; // 改变是否可移动状态
  lockRotate: () => void; // 改变是否可旋转状态
}
export class Operation extends Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }
  render() {
    const {
      preType, prePos, preRotate, preParams, movable, rotatable,
      setPreGeometry, lockMove, lockRotate, preToEntity,
      updatePrePos, updatePreRotate, updatePreParams,
    } = this.props;
    const preItem = GEOMETRYS.filter(({ type }) => type === preType)[0];
    const preName = preItem ? preItem.name : '未选中几何体';
    return (
      <div className={container}>
        <Card className={card} size="small" bordered={false} title="基础几何体">
          {GEOMETRYS.map(({ name, type }) => (
            <CheckableTag
              key={type}
              checked={type === preType}
              onChange={() => (type !== preType) && setPreGeometry(type)}
            >
              {name}
            </CheckableTag>
          ))}
        </Card>

        <Card
          className={card}
          size="small"
          bordered={false}
          title={`位置信息-${preName}`}
          extra={
            <a href="javascript:;" onClick={lockMove}>
              <Icon type={movable ? 'unlock' : 'lock'} theme="twoTone" />
            </a>
          }
        >
          <DatGui className={gui} data={prePos} onUpdate={updatePrePos}>
            {Object.keys(prePos).map(
              name => <DatNumber key={name} path={name} label={name} min={-MAX_SIZE} max={MAX_SIZE} step={STEP / 4} />
            )}
          </DatGui>
        </Card>

        <Card
          className={card}
          size="small"
          bordered={false}
          title={`旋转信息(度)-${preName}`}
          extra={
            <a href="javascript:;" onClick={lockRotate}>
              <Icon type={rotatable ? 'unlock' : 'lock'} theme="twoTone" />
            </a>
          }
        >
          <DatGui className={gui} data={preRotate} onUpdate={updatePreRotate}>
            {Object.keys(preRotate).map(
              name => <DatNumber key={name} path={name} label={name} min={-180} max={180} step={1} />
            )}
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
              name => {
                if (name.includes('Segments')) return (
                  <DatNumber key={name} path={name} label={name.replace('Segments', 'Seg')} min={3} max={STEP * 2} step={1} />
                );
                return (
                  <DatNumber key={name} path={name} label={name} min={0} max={MAX_SIZE} step={STEP / 4} />
                );
              }
            )}
          </DatGui>
        </Card>
      </div>
    );
  }
}
