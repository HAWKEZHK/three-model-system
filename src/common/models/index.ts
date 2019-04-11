export type IGeometrys = 'BoxGeometry' | 'SphereGeometry' | 'CylinderGeometry' | 'TorusGeometry';

export interface IParams {
  DEFAULT: {
    width: number;
    height: number;
    depth: number;
  },
  BoxGeometry: {
    width: number;
    height: number;
    depth: number;
  },
  SphereGeometry: {
    radius: number;
    widthSeg: number;
    heightSeg: number;
  },
  CylinderGeometry: {
    radiusTop: number;
    radiusBottom: number;
    height: number;
    radiusSeg: number;
  },
  TorusGeometry: {
    radius: number;
    tube: number;
    radialSeg: number;
    tubularSeg: number;
  },
}
