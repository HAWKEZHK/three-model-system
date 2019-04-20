import React, { Component } from 'react';
import { Icon, Drawer, Menu } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import * as THREE from 'three';
import { Mesh, Group, Geometry } from 'three';
import * as threeObjMtlLoader from 'three-obj-mtl-loader';
import STLLoader from 'three-stl-loader';

import { IThreeMenu } from '@/common/models';
import { THREE_MENU, LIB_SRC } from '@/common/constants';
import { createPreThree } from '@/common/helpers';

import styles from './index.less';

const { SubMenu } = Menu;
const { OBJLoader, MTLLoader } = threeObjMtlLoader;

interface IProps {
  visible: boolean; // 抽屉代开状态
  closeDrawer: () => void; // 关闭抽屉
  addToPreThree: (preThree: Mesh | Group) => void; // 转化为预览几何体
}
export class ThreeDrawer extends Component<IProps, {}> {
  private objLoader: any;
  private mtlLoader: any;
  private stlLoader: any;

  constructor(props: IProps) {
    super(props);
    this.state = {};
    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader();
    this.stlLoader = new (STLLoader(THREE))();
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
    const { addToPreThree, closeDrawer } = this.props;
    const [name, type] = keyPath;
    const baseSrc = `${LIB_SRC}/${type}/${name}`;
    try {
      switch (type) {
        case 'OBJ-MTL': {
          this.mtlLoader.load(`${baseSrc}/${name}.mtl`, (materials: any) => {
            materials.preload();
            this.objLoader.setMaterials(materials);

            this.objLoader.load(`${baseSrc}/${name}.obj`, (group: Group) => {
              addToPreThree(group);
              closeDrawer();
            });
          });
          break;
        }
        case 'STL': {
          this.stlLoader.load(`${baseSrc}.stl`, (geometry: Geometry) => {
            addToPreThree(createPreThree(geometry));
            closeDrawer();
          });
          break;
        }
        default: break;
      }
    } catch (err) {
      console.info('err');
    }
  }
}
