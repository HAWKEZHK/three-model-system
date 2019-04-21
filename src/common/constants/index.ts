import { IGeometrys, IParams, IThreeMenu } from '@/common/models';

// 最大值
export const MAX_SIZE = 1200;
// 一个刻度
export const STEP = 60;
// 几何体颜色
export const BASE_COLOR = '#ff0000';

// 相机
export const CAMARE = {
  fov: 45, // 视角
  near: 50, // 相机距离近裁剪面距离
  far: 4000, // 相机距离远裁剪面距离
  pos: { x: 1000, y: 1000, z: 1000 }, // 相机位置
  lookAt: { x: 0, y: 0, z: 0 }, // 视点
};

// 基础几何体
export const GEOMETRYS: { name: string, type: IGeometrys }[] = [
  { name: '立方体', type: 'BoxGeometry' },
  { name: '球体', type: 'SphereGeometry' },
  { name: '柱体', type: 'CylinderGeometry' },
  { name: '环', type: 'TorusGeometry' },
];

// 默认值
export const DEFAULT_XYZ = { x: 0, y: 0, z: 0 };
export const DEFAULT_PARAMS: IParams = {
  DEFAULT: { width: 0, height: 0, depth: 0 },
  BoxGeometry: {
    width: STEP,
    height: STEP,
    depth: STEP,
  },
  SphereGeometry: {
    radius: STEP / 2,
    widthSegments: STEP,
    heightSegments: STEP,
  },
  CylinderGeometry: {
    radiusTop: STEP / 2,
    radiusBottom: STEP / 2,
    height: STEP,
    radiusSegments: STEP,
  },
  TorusGeometry: {
    radius: STEP / 2,
    tube: STEP / 4,
    radialSegments: STEP,
    tubularSegments: STEP,
  },
};

// 3D 库（示例）
export const LIB_SRC = 'src/static/3d-files';
export const THREE_MENU: IThreeMenu[] = [
  {
    type: 'OBJ-MTL',
    items: ['宝马'],
  },
  {
    type: 'STL',
    items: ['螺丝', '螺母'],
  },
];
