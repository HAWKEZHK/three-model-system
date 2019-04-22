export type IGeometrys = 'BoxGeometry' | 'SphereGeometry' | 'CylinderGeometry' | 'TorusGeometry';
export type IChangeType = 'pos' | 'rotate' | 'params';
export type IFileType = 'OBJ' | 'STL';

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
  preType: IGeometrys | 'External' | null; // 几何体类型
  prePos: { x: number, y: number, z: number }; // 预览几何体位置
  preRotate: { x: number, y: number, z: number }; // 预览几何体旋转位置
  preParams: IParams['DEFAULT'] | IParams[IGeometrys]; // 预览几何体参数
  changeType: IChangeType | null; // 操作类型
}

export interface IThreeMenu {
  type: string;
  items: string[];
}
