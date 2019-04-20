import {
  Geometry, MeshLambertMaterial, Mesh, BoxGeometry, SphereGeometry, CylinderGeometry, TorusGeometry,
} from 'three';

import { BASE_COLOR, DEFAULT_PARAMS } from '@/common/constants';
import { IGeometrys, IParams } from '@/common/models';

// 创建预览几何体
export const createPreThree = (
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
interface ICreateTypePreThree {
  (type: IGeometrys, params?: IParams[IGeometrys]): Mesh
}
export const createTypePreThree: ICreateTypePreThree = (
  type, params = DEFAULT_PARAMS[type]
) => {
  let geometry = new Geometry();
  switch (type) {
    case 'BoxGeometry': {
      const { width, height, depth } = params as IParams['BoxGeometry'];
      geometry = new BoxGeometry(width, height, depth);
      break;
    }
    case 'SphereGeometry': {
      const { radius, widthSegments, heightSegments } = params as IParams['SphereGeometry'];
      geometry = new SphereGeometry(radius, widthSegments, heightSegments);
      break;
    }
    case 'CylinderGeometry': {
      const { radiusTop, radiusBottom, height, radiusSegments } = params as IParams['CylinderGeometry'];
      geometry = new CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments);
      break;
    }
    case 'TorusGeometry': {
      const { radius, tube, radialSegments, tubularSegments } = params as IParams['TorusGeometry'];
      geometry = new TorusGeometry(radius, tube, radialSegments, tubularSegments);
      break;
    }
  }
  return createPreThree(geometry);
};
