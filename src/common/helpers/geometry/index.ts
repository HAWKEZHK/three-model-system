import {
  Geometry, MeshLambertMaterial, Mesh, BoxGeometry, SphereGeometry, CylinderGeometry, TorusGeometry,
} from 'three';

import { STEP } from '@/constants';
import { IGeometrys } from '@/common/models';

// 创建几何体
export const createGeometry = (
  geometry: Geometry, // 几何体
  isPre?: boolean, // 是否为预览状态
): Mesh => new Mesh(
  geometry,
  new MeshLambertMaterial({ color: '#ff0000', opacity: isPre ? .5 : 1, transparent: true }),
);

// 创建指定的几何体
export const createTypeGeometry = (
  type: IGeometrys, // 几何体类型
  isPre?: boolean, // 是否为预览状态
): Mesh => {
  let geometry = new Geometry();
  switch (type) {
    case 'cube': geometry = new BoxGeometry(STEP, STEP, STEP); break;
    case 'sphere': geometry = new SphereGeometry(STEP / 2, STEP, STEP); break;
    case 'cylinder': geometry = new CylinderGeometry(STEP / 2, STEP / 2, STEP); break;
    case 'torus': geometry = new TorusGeometry(STEP / 2, STEP / 4, STEP, STEP); break;
  }
  return createGeometry(geometry, isPre);
};
