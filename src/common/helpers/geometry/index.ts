import {
  Geometry, MeshLambertMaterial, Mesh, BoxGeometry, SphereGeometry, CylinderGeometry, TorusGeometry,
} from 'three';

import { STEP, BASE_COLOR } from '@/constants';
import { IGeometrys } from '@/common/models';

// 创建预览几何体
export const createPreGeometry = (
  geometry: Geometry, // 几何体
): Mesh => new Mesh(
  geometry,
  new MeshLambertMaterial({
    color: BASE_COLOR,
    opacity: .5,
    transparent: true,
  }),
);

// 创建指定的预览几何体
export const createTypePreGeometry = (
  type: IGeometrys, // 几何体类型
): Mesh => {
  let geometry = new Geometry();
  switch (type) {
    case 'cube': geometry = new BoxGeometry(STEP, STEP, STEP); break;
    case 'sphere': geometry = new SphereGeometry(STEP / 2, STEP, STEP); break;
    case 'cylinder': geometry = new CylinderGeometry(STEP / 2, STEP / 2, STEP); break;
    case 'torus': geometry = new TorusGeometry(STEP / 2, STEP / 4, STEP, STEP); break;
  }
  return createPreGeometry(geometry);
};
