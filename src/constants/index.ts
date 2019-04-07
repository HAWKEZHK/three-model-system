import { IGeometrys } from '@/common/models';

// 最大值
export const MAX_SIZE = 1000;
export const STEP = 50;

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
  { name: '正方体', type: 'cube' },
  { name: '球体', type: 'sphere' },
  { name: '柱体', type: 'cylinder' },
  { name: '环', type: 'torus' },
];
