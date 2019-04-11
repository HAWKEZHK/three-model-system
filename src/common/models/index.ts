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
    widthSegments: number;
    heightSegments: number;
  },
  CylinderGeometry: {
    radiusTop: number;
    radiusBottom: number;
    height: number;
    radiusSegments: number;
  },
  TorusGeometry: {
    radius: number;
    tube: number;
    radialSegments: number;
    tubularSegments: number;
  },
}


export interface ICommon {
  preType: IGeometrys | null; // 几何体类型
  prePos: { x: number, y: number, z: number }; // 预览几何体位置
  preParams: IParams['DEFAULT'] | IParams[IGeometrys]; // 预览几何体参数
  movable: boolean; // 是否可移动
}
