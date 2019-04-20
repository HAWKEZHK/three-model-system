import React, { Component } from 'react';
import { Icon, Drawer, Menu } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import * as THREE from 'three';
import { Mesh, Geometry } from 'three';

import { IThreeMenu } from '@/common/models';
import { THREE_MENU, LIB_SRC } from '@/common/constants';
import { createpreMesh } from '@/common/helpers';

import styles from './index.less';

const { SubMenu } = Menu;
const STLLoader = require('three-stl-loader')(THREE);

interface IProps {
  visible: boolean; // 抽屉代开状态
  closeDrawer: () => void; // 关闭抽屉
  addToScene: (mesh: Mesh) => void;
}
export class ThreeDrawer extends Component<IProps, {}> {
  private stlLoader: any;

  constructor(props: IProps) {
    super(props);
    this.state = {};
    this.stlLoader = new STLLoader();
  }
  render() {
    const { visible, closeDrawer } = this.props;
    return (
      <Drawer
        title={<><Icon type="tool" /> 3D 文件库</>}
        placement="left"
        className={styles.drawer}
        closable={false}
        visible={visible}
        onClose={closeDrawer}
      >
        <Menu mode="inline" theme="light" defaultOpenKeys={THREE_MENU.map(({ type }) => type)} onClick={this.handleSelect}>
          {THREE_MENU.map(({ type, items }: IThreeMenu) => (
            <SubMenu key={type} title={`${type} 文件`}>
              {items.map((item: string) => <Menu.Item key={item}>{item}</Menu.Item>)}
            </SubMenu>
          ))}
        </Menu>
      </Drawer>
    );
  }

  // 选中
  private handleSelect = ({ keyPath }: ClickParam) => {
    const { closeDrawer, addToScene } = this.props;
    const [name, type] = keyPath;
    switch (type) {
      case 'STL': {
        this.stlLoader.load(`${LIB_SRC}/STL/${name}.stl`,(geometry: Geometry) => addToScene(createpreMesh(geometry)));
        break;
      }
      default: break;
    }
    setTimeout(closeDrawer, 500);
  }
}
