import {
  Geometry, MeshLambertMaterial, Mesh, BoxGeometry, SphereGeometry, CylinderGeometry, TorusGeometry,
} from 'three';

import { BASE_COLOR, DEFAULT_PARAMS } from '@/constants';
import { IGeometrys, IParams } from '@/common/models';

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
interface ICreateTypePreGeometry {
  (
    type: IGeometrys, // 几何体类型
    params?: IParams[IGeometrys], // 参数
  ): Mesh
}
export const createTypePreGeometry: ICreateTypePreGeometry = (
  type, params = DEFAULT_PARAMS[type]
) => {
  let geometry = new Geometry();
  switch (type) {
    case 'BoxGeometry': {
      const {
        width, height, depth, widthSegments, heightSegments, depthSegments,
      } = params as IParams['BoxGeometry'];
      geometry = new BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
      break;
    }
    case 'SphereGeometry': {
      const {
        radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength,
      } = params as IParams['SphereGeometry'];
      geometry = new SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);
      break;
    }
    case 'CylinderGeometry': {
      const {
        radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded, thetaStart, thetaLength,
      } = params as IParams['CylinderGeometry'];
      geometry = new CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded, thetaStart, thetaLength);
      break;
    }
    case 'TorusGeometry': {
      const {
        radius, tube, radialSegments, tubularSegments, arc,
      } = params as IParams['TorusGeometry'];
      geometry = new TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
      break;
    }
  }
  return createPreGeometry(geometry);
};
