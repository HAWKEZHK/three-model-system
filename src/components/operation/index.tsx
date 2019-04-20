import React, { Component } from 'react';
import { Card, Tag, Icon } from 'antd';
import DatGui, * as ReactDatGui from 'react-dat-gui';

import { IGeometrys, ICommon, IChangeType } from '@/common/models';
import { GEOMETRYS, MAX_SIZE, STEP } from '@/common/constants';

import styles from './index.less';
import 'react-dat-gui/build/react-dat-gui.css';

const { DatNumber } = ReactDatGui;
const { CheckableTag } = Tag;

interface IProps extends ICommon {
  setPreThree: (preType: IGeometrys | null) => void; // 生成指定预览几何体
  confirm: (type: IChangeType) => void; // 改变状态
  update: (
    changeType: IChangeType,
    query: IProps['prePos'] | IProps['preRotate'] | IProps['preParams'],
  ) => void; // 更新参数
  openDrawer: () => void; // 打开抽屉
}
export class Operation extends Component<IProps, {}> {
  constructor(props: IProps) {
    super(props);
    this.state = {};
  }
  render() {
    const {
      preType, prePos, preRotate, preParams, changeType,
      setPreThree, update, confirm, openDrawer,
    } = this.props;
    const preItem = GEOMETRYS.filter(({ type }) => type === preType)[0];
    const preName = preItem ? preItem.name : '未选中几何体';
    return (
      <div className={styles.container}>
        <Card className={styles.card} size="small" bordered={false} title="基础几何体">
          {GEOMETRYS.map(({ name, type }) => (
            <CheckableTag
              key={type}
              checked={type === preType}
              onChange={() => (type !== preType) && setPreThree(type)}
            >
              {name}
            </CheckableTag>
          ))}
        </Card>

        <Card
          className={styles.card}
          size="small"
          bordered={false}
          title={`位置信息-${preName}`}
          extra={
            <a href="javascript:;" onClick={() => confirm('pos')}>
              <Icon type={changeType === 'pos' ? 'unlock' : 'lock'} theme="twoTone" />
            </a>
          }
        >
          <DatGui className={styles.gui} data={prePos} onUpdate={(query: IProps['prePos']) => update('pos', query)}>
            {Object.keys(prePos).map(
              name => <DatNumber key={name} path={name} label={name} min={-MAX_SIZE} max={MAX_SIZE} step={STEP / 4} />
            )}
          </DatGui>
        </Card>

        <Card
          className={styles.card}
          size="small"
          bordered={false}
          title={`旋转信息(度)-${preName}`}
          extra={
            <a href="javascript:;" onClick={() => confirm('rotate')}>
              <Icon type={changeType === 'rotate' ? 'unlock' : 'lock'} theme="twoTone" />
            </a>
          }
        >
          <DatGui className={styles.gui} data={preRotate} onUpdate={(query: IProps['preRotate']) => update('rotate', query)}>
            {Object.keys(preRotate).map(
              name => <DatNumber key={name} path={name} label={name} min={-180} max={180} step={1} />
            )}
          </DatGui>
        </Card>

        <Card
          className={styles.card}
          size="small"
          bordered={false}
          title={`几何信息-${preName}`}
          extra={<a href="javascript:;" onClick={() => confirm('params')}>保存</a>}
        >
          <DatGui className={styles.gui} data={preParams} onUpdate={(query: IProps['preParams']) => update('params', query)}>
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

        <Card
          className={styles.card}
          size="small"
          bordered={false}
          title="文件操作"
          extra={<a href="javascript:;">下载文件</a>}
        >
          <div className={styles['drawer-box']} onClick={openDrawer}>
            <Icon className={styles.inbox} type="inbox" />
            <div className={styles.tip}>从3D库中添加模型</div>
            <div className={styles.hint}>.obj / .stl / .json</div>
          </div>
        </Card>
      </div>
    );
  }
}
