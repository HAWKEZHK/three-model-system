export type IGeometrys = 'BoxGeometry' | 'SphereGeometry' | 'CylinderGeometry' | 'TorusGeometry';

export interface IParams {
  DEFAULT: {
    width: 0,
    height: 0,
    depth: 0,
  },
  BoxGeometry: {
    width: number;
    height: number;
    depth: number;
    widthSegments?: number;
    heightSegments?: number;
    depthSegments?: number;
  },
  SphereGeometry: {
    radius: number;
    widthSegments: number;
    heightSegments: number;
    phiStart?: number;
    phiLength?: number;
    thetaStart?: number;
    thetaLength?: number;
  },
  CylinderGeometry: {
    radiusTop: number;
    radiusBottom: number;
    height: number;
    radiusSegments?: number;
    heightSegments?: number;
    openEnded?: boolean;
    thetaStart?: number;
    thetaLength?: number;
  },
  TorusGeometry: {
    radius: number;
    tube: number;
    radialSegments: number;
    tubularSegments: number;
    arc?: number;
  },
}
