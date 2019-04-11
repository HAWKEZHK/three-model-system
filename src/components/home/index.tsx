import React, { Component, RefObject, createRef, ReactPropTypes } from 'react';
import { Layout, message } from 'antd';

import {
  Scene, WebGLRenderer, PerspectiveCamera, ArrowHelper, Raycaster,
  Geometry, Mesh, MeshLambertMaterial, Vector2, Vector3,
  AmbientLight, DirectionalLight, LineSegments, LineBasicMaterial, PlaneBufferGeometry,
} from 'three';
import OrbitControls from 'three-orbitcontrols';
import TransformControls from 'three-transformcontrols';

import { createPreGeometry, createTypePreGeometry } from '@/common/helpers';
import { MAX_SIZE, STEP, CAMARE, BASE_COLOR, DEFAULT_POS, DEFAULT_PARAMS } from '@/constants';
import { IGeometrys, IParams } from '@/common/models';
import { Operation } from '../operation';
import styles from './index.less';

const { Content, Sider } = Layout;
const { container, sider, content, close } = styles;

interface IState {
  collapsed: boolean; // 侧边栏状态
  movable: boolean; // 是否可移动
  preType: IGeometrys | null; // 预览类型
  prePos: { x: number, y: number, z: number }, // 预览几何体位置
  preParams: IParams['DEFAULT'] | IParams[IGeometrys], // 预览几何体参数
}
export class Home extends Component<{}, IState> {
  private stageRef: RefObject<HTMLDivElement>;
  private scene: Scene; // 场景
  private camera: PerspectiveCamera;  // 相机
  private renderer: WebGLRenderer; // 渲染器
  protected raycaster: Raycaster; // 投射器
  private orbitControls: any; // 轨道控制器
  private transformControls: any; // 传送控制器

  private entities: Mesh[]; // 所有实体集合
  private preGeometry: Mesh | null; // 预览几何体

  constructor(props: ReactPropTypes) {
    super(props);
    this.state = {
      collapsed: false,
      movable: true,
      preType: null,
      prePos: DEFAULT_POS,
      preParams: DEFAULT_PARAMS.DEFAULT,
    };
    this.stageRef = createRef();
    this.scene = new Scene();
    this.camera = new PerspectiveCamera();
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.raycaster = new Raycaster();
    this.orbitControls = null;
    this.transformControls = null;
    this.entities = [];
    this.preGeometry = null;
  }
  componentDidMount() {
    this.initThree();
    this.bindActions();

    // this.transformControls.attach(cube);
  }
  render() {
    const { collapsed, preType, prePos, preParams, movable } = this.state;
    return (
      <Layout>
        <Layout>
          <Content className={`${content}${collapsed ? ` ${close}` : ''}`}>
            <div className={container} ref={this.stageRef} />
          </Content>
        </Layout>
        <Sider
          className={sider}
          width="300"
          collapsedWidth="50"
          collapsible={true}
          collapsed={collapsed}
          onCollapse={val => this.setState({ collapsed: val }, this.handleResize)}
          reverseArrow={true}
        >
          {!collapsed && (
            <Operation
              preType={preType}
              prePos={prePos}
              preParams={preParams}
              movable={movable}
              setPreGeometry={this.setPreGeometry}
              updatePrePos={this.updatePrePos}
              updatePreParams={this.updatePreParams}
              lockMove={() => this.setState({ movable: !movable })}
              preToEntity={this.preToEntity}
            />
          )}
        </Sider>
      </Layout>
    );
  }

  // 绑定事件
  private bindActions = () => {
    const stage = this.stageRef.current;
    if (!stage) return;

    window.onresize = this.handleResize;
    stage.onmousemove = this.handleMouseMove;
    stage.onmouseup = this.handleMouseUp;
    stage.ondblclick = this.handledbClick;
  }

  // 大小变化重新渲染
  private handleResize = () => {
    const stage = this.stageRef.current;
    if (!stage) return;

    const { offsetWidth: width, offsetHeight: height } = stage;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // 鼠标移动预览几何体随动
  private handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
    const { movable } = this.state;
    if (!this.preGeometry || !movable) return;

    const intersect = this.getIntersect(clientX, clientY);
    if (!intersect) return;
    const { point, face } = intersect;
    this.updatePrePos(
      point.clone()
        .add(face ? face.normal : new Vector3(0, 1, 0)) // 保证在 +y 方向 
        .divideScalar(STEP).floor().multiplyScalar(STEP) // 除以 STEP 取整再乘
        .addScalar(STEP / 2) // 每个位置增加 STEP / 2
    );
  }

  // 鼠标点击-添加或删除预览几何体
  private handleMouseUp = ({ button }: MouseEvent) => {
    if (!this.preGeometry) return;

    let movable = true;
    if (button === 0) { // 左键-将预览几何体固定位置
      movable = false;
    } else if (button === 2) { // 右键-删除预览几何体
      this.setPreGeometry(null);
    }
    this.setState({ movable });
  }

  // 鼠标双击-实体转化为预览几何体
  private handledbClick = ({ clientX, clientY }: MouseEvent) => {
    if (this.preGeometry) return;

    const intersect = this.getIntersect(clientX, clientY);
    if (!intersect) return;
    const mesh = intersect.object as Mesh;
    const geometry = mesh.geometry as any;
    const prePos = mesh.position;
    const preType = geometry.type as IGeometrys;
    const keys = Object.keys(DEFAULT_PARAMS[preType]);
    const preParams = {} as IState['preParams'];
    keys.forEach(key => preParams[key] = geometry.parameters[key]);
    this.removeEntity(mesh, () => {
      this.preGeometry = createPreGeometry(geometry);
      this.preGeometry.position.copy(prePos);
      this.scene.add(this.preGeometry);
      this.renderThree();
      this.setState({ preType, prePos, preParams });
    });
  }

  // canvas 渲染
  private renderThree = () => this.renderer.render(this.scene, this.camera);

  // 初始化
  private initThree = () => {
    const stage = this.stageRef.current;
    if (!stage) return;
    const { offsetWidth: width, offsetHeight: height } = stage;

    this.initCamera(width / height);
    this.initOrbitControls();
    this.initTransformControls();
    this.initRenderer(width, height);

    this.initLight();
    this.initAxis();
    this.initGridding();

    this.renderThree();
    stage.appendChild(this.renderer.domElement);
  }

  // 初始化渲染器
  private initRenderer = (width: number, height: number) => {
    this.renderer.setSize(width, height);
  }

  // 初始化相机
  private initCamera = (aspect: number) => {
    const { fov, near, far, pos, lookAt } = CAMARE;
    this.camera = new PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(pos.x, pos.y, pos.z);
    this.camera.lookAt(new Vector3(lookAt.x, lookAt.y, lookAt.z));
  }

  // 初始化光源
  private initLight = () => {
    const directionalLight = new DirectionalLight('#fff');
    directionalLight.position.set(4, 3, 2).normalize();
    this.scene.add(
      new AmbientLight('#606060'),
      directionalLight,
    );
  }

  // 初始化坐标系
  private initAxis = () => {
    this.scene.add(
      new ArrowHelper(new Vector3(MAX_SIZE, 0, 0), new Vector3(-MAX_SIZE, 0, 0), 2 * MAX_SIZE, 0xFF0000, STEP),
      new ArrowHelper(new Vector3(0, MAX_SIZE, 0), new Vector3(0, -MAX_SIZE, 0), 2 * MAX_SIZE, 0x00FF00, STEP),
      new ArrowHelper(new Vector3(0, 0, MAX_SIZE), new Vector3(0, 0, -MAX_SIZE), 2 * MAX_SIZE, 0x0000FF, STEP),
    );
  }

  // 初始化网格线
  private initGridding = () => {
    const geometry = new Geometry();
    for (let i = -MAX_SIZE; i <= MAX_SIZE; i += STEP) {
      geometry.vertices.push(
        new Vector3(-MAX_SIZE, 0, i),
        new Vector3(MAX_SIZE, 0, i),
        new Vector3(i, 0, -MAX_SIZE),
        new Vector3(i, 0, MAX_SIZE),
      );
    }
    this.scene.add(
      new LineSegments(
        geometry,
        new LineBasicMaterial({ color: '#000', opacity: .1, transparent: true }),
      ),
    );
    const plane = new Mesh(
      (new PlaneBufferGeometry(2 * MAX_SIZE, 2 * MAX_SIZE)).rotateX(-Math.PI / 2),
      new MeshLambertMaterial({ visible: false }),
    ); // 平面(隐藏)
    this.addEntity(plane);
  }

  // 初始化轨道控制器
  private initOrbitControls = () => {
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.maxDistance = 2 * MAX_SIZE;
    this.orbitControls.minDistance = 2 * STEP;

    const stage = this.stageRef.current;
    if (!stage) return;

    this.orbitControls.addEventListener('change', () => {
      const { movable } = this.state;
      stage.onmouseup = null;
      if (this.preGeometry && movable) this.preGeometry.visible = false;
      this.renderThree();
    });
    this.orbitControls.addEventListener('end', () => {
      stage.onmouseup = this.handleMouseUp;
      if (this.preGeometry) this.preGeometry.visible = true;
      this.renderThree();
    });
  }

  // 初始化传送控制器
  private initTransformControls = () => {
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.addEventListener('change', this.renderThree);
    this.scene.add(this.transformControls);
  }

  // 得到目标元素
  private getIntersect = (mouseX: number, mouseY: number) => {
    const stage = this.stageRef.current;
    if (!stage) return;
    const { offsetWidth, offsetHeight } = stage;
    this.raycaster.setFromCamera(
      new Vector2(
        -(offsetWidth / 2 - mouseX) / (offsetWidth / 2),
        (offsetHeight / 2 - mouseY) / (offsetHeight / 2),
      ), // three.js 标准坐标
      this.camera,
    );
    return this.raycaster.intersectObjects(this.entities)[0];
  }
  // 设置预览几何体位置
  private updatePrePos = ({ x, y, z }: IState['prePos']) => {
    if (!this.preGeometry) {
      this.noSelTip();
      return;
    }
    this.preGeometry.position.x = x;
    this.preGeometry.position.y = y;
    this.preGeometry.position.z = z;
    this.renderThree();
    this.setState({ prePos: { x, y, z } });
  }
  // 设置预览几何体参数
  private updatePreParams = (preParams: IParams[IGeometrys]) => {
    if (!this.preGeometry) {
      this.noSelTip();
      return;
    }
    const { preType, prePos: { x, y, z } } = this.state;
    if (!preType) return;
    this.scene.remove(this.preGeometry);
    this.preGeometry = createTypePreGeometry(preType, preParams);
    this.preGeometry.position.copy(new Vector3(x, y, z));
    this.scene.add(this.preGeometry);
    this.renderThree();
    this.setState({ preParams });
  }
  // 生成指定预览几何体
  private setPreGeometry = (preType: IState['preType']) => {
    if (this.preGeometry) this.scene.remove(this.preGeometry);
    if (!preType) {
      this.preGeometry = null;
      this.setState({ preParams: DEFAULT_PARAMS.DEFAULT });
    } else {
      this.preGeometry = createTypePreGeometry(preType);
      this.scene.add(this.preGeometry);
      this.setState({ preParams: DEFAULT_PARAMS[preType] });
    }
    this.renderThree();
    this.setState({ preType, prePos: DEFAULT_POS, movable: true });
  }
  // 将预览几何体转为实体
  private preToEntity = () => {
    if (!this.preGeometry) return;
    const geometry = this.preGeometry.clone();
    geometry.material = new MeshLambertMaterial({ color: BASE_COLOR });
    this.addEntity(geometry);
    this.renderThree();
    this.setState({ movable: true });
  }
  // 添加实体
  private addEntity = (mesh: Mesh) => {
    this.scene.add(mesh);
    this.entities.push(mesh);
  }
  // 移除实体
  private removeEntity = (mesh: Mesh, callback?: () => void) => {
    const index = this.entities.indexOf(mesh);
    if (index === 0) return;
    this.entities.splice(index, 1);
    this.scene.remove(mesh);
    callback && callback();
  }
  // 未选择提示
  private noSelTip = () => {
    this.setState({ prePos: DEFAULT_POS, preParams: DEFAULT_PARAMS.DEFAULT });
    const messages = document.body.querySelector('.ant-message-notice');
    if (!messages) message.warning('还未选择几何体');
  }
}
