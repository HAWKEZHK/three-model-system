import React, { Component, RefObject, createRef, ReactPropTypes } from 'react';
import { Layout, message } from 'antd';

import {
  Scene, WebGLRenderer, PerspectiveCamera, ArrowHelper, Raycaster,
  Mesh, Geometry, PlaneBufferGeometry, MeshLambertMaterial, Vector2, Vector3,
  AmbientLight, DirectionalLight, LineSegments, LineBasicMaterial,
} from 'three';
import OrbitControls from 'three-orbitcontrols';
import TransformControls from 'three-transformcontrols';

import { createPreGeometry, createTypePreGeometry } from '@/common/helpers';
import { MAX_SIZE, STEP, CAMARE, BASE_COLOR, DEFAULT_XYZ, DEFAULT_PARAMS } from '@/common/constants';
import { IGeometrys, IParams, ICommon } from '@/common/models';
import { Operation } from '../operation';
import styles from './index.less';

const { Content, Sider } = Layout;
const { container, sider, content, close } = styles;

interface IState extends ICommon {
  collapsed: boolean; // 侧边栏状态
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
      rotatable: false,
      preType: null,
      prePos: DEFAULT_XYZ,
      preRotate: DEFAULT_XYZ,
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
  }
  render() {
    const { collapsed, preType, prePos, preRotate, preParams, movable, rotatable } = this.state;
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
              preRotate={preRotate}
              preParams={preParams}
              movable={movable}
              rotatable={rotatable}
              setPreGeometry={this.setPreGeometry}
              updatePrePos={this.updatePrePos}
              updatePreRotate={this.updatePreRotate}
              updatePreParams={this.updatePreParams}
              preToEntity={this.preToEntity}
              lockMove={this.lockMove}
              lockRotate={this.lockRotate}
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
    const { movable } = this.state;
    if (!this.preGeometry) return;

    if (button === 0 && movable) this.setState({ movable: false, rotatable: true }, this.renderThree); // 左键-将预览几何体固定位置
    if (button === 2) { // 右键-删除预览几何体
      this.setPreGeometry(null);
      this.setState({ movable: true, rotatable: false });
    }
  }

  // 鼠标双击-实体转化为预览几何体
  private handledbClick = ({ clientX, clientY }: MouseEvent) => {
    if (this.preGeometry) return;
    const intersect = this.getIntersect(clientX, clientY);
    if (!intersect) return;

    const mesh = intersect.object as Mesh; // 选中的几何体
    const { geometry, position: prePos, rotation: preRotate } = mesh as any;
    const preType = geometry.type as IGeometrys;
    const preParams = {} as IState['preParams'];
    Object.keys(DEFAULT_PARAMS[preType]).forEach(key => preParams[key] = geometry.parameters[key]);

    // 实体数组中删除
    const index = this.entities.indexOf(mesh);
    if (index === 0) return;
    this.entities.splice(index, 1);
    this.scene.remove(mesh);

    // 生成相同属性的预览几何体
    this.preGeometry = createPreGeometry(geometry);
    this.preGeometry.position.copy(prePos);
    this.preGeometry.rotation.copy(preRotate);
    this.scene.add(this.preGeometry);

    const x = preRotate.x * 180 / Math.PI;
    const y = preRotate.y * 180 / Math.PI;
    const z = preRotate.z * 180 / Math.PI;
    this.setState({ preType, prePos, preRotate: { x, y, z }, preParams }, this.renderThree);
  }

  // canvas 渲染
  private renderThree = () => {
    const { rotatable } = this.state;
    if (this.preGeometry && rotatable) {
      this.scene.add(this.transformControls);
      this.transformControls.attach(this.preGeometry);
    } else {
      this.scene.remove(this.transformControls);
    }
    this.renderer.render(this.scene, this.camera);
  }

  // 初始化
  private initThree = () => {
    const stage = this.stageRef.current;
    if (!stage) return;
    const { offsetWidth: width, offsetHeight: height } = stage;

    this.initCamera(width / height);
    this.initOrbitControls();
    this.initTransformControls();
    this.renderer.setSize(width, height);

    this.initLight();
    this.initAxis();
    this.initGridding();
    this.renderThree();
    stage.appendChild(this.renderer.domElement);
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
    this.scene.add(new AmbientLight('#606060'), directionalLight);
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
      if (this.preGeometry && movable) this.preGeometry.visible = false; // 隐藏可移动的预览几何体
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
    this.transformControls.setSize(.5);
    this.transformControls.setMode('rotate');
    this.transformControls.addEventListener('objectChange', ({ target }: any) => {
      const { getMode, object: { rotation } } = target;
      if (getMode() !== 'rotate') return;
      const x = rotation.x * 180 / Math.PI;
      const y = rotation.y * 180 / Math.PI;
      const z = rotation.z * 180 / Math.PI;
      this.setState({ preRotate: { x, y, z } }, this.renderThree);
    });
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
    if (!this.preGeometry) { this.noSelTip(); return; }
    const { movable, rotatable } = this.state;

    this.preGeometry.position.set(x, y, z);
    this.setState({ prePos: { x, y, z } }, this.renderThree);

    if (!movable) this.setState({ movable: true });
    if (rotatable) this.setState({ rotatable: false });
  }

  // 设置预览几何体旋转信息
  private updatePreRotate = ({ x, y, z }: IState['preRotate']) => {
    if (!this.preGeometry) { this.noSelTip(); return; }
    const { movable, rotatable } = this.state;

    const [radX, radY, radZ] = [x, y, z].map(item => item * Math.PI / 180);
    this.preGeometry.rotation.set(radX, radY, radZ);
    this.setState({ preRotate: { x, y, z } }, this.renderThree);

    if (!rotatable) this.setState({ rotatable: true });
    if (movable) this.setState({ movable: false });
  }

  // 设置预览几何体参数
  private updatePreParams = (preParams: IParams[IGeometrys]) => {
    if (!this.preGeometry) { this.noSelTip(); return; }

    const { preType, prePos, preRotate, movable, rotatable } = this.state;
    if (!preType) return;
    this.scene.remove(this.preGeometry);
    this.preGeometry = createTypePreGeometry(preType, preParams);

    this.preGeometry.position.set(prePos.x, prePos.y, prePos.z);

    const [radX, radY, radZ] = [preRotate.x, preRotate.y, preRotate.z].map(item => item * Math.PI / 180);
    this.preGeometry.rotation.set(radX, radY, radZ);

    this.scene.add(this.preGeometry);
    this.setState({ preParams }, this.renderThree);

    if (movable) this.setState({ movable: false });
    if (rotatable) this.setState({ rotatable: false });
  }

  // 改变是否可移动状态
  private lockMove = () => {
    if (!this.preGeometry) { this.noSelTip(); return; }

    const { movable, rotatable } = this.state;
    this.setState({ movable: !movable }, this.renderThree);
    if (rotatable) this.setState({ rotatable: false });
  }

  // 改变是否可旋转状态
  private lockRotate = () => {
    if (!this.preGeometry) { this.noSelTip(); return; }

    const { movable, rotatable } = this.state;
    this.setState({ rotatable: !rotatable }, this.renderThree);
    if (movable) this.setState({ movable: false });
  }

  // 生成指定预览几何体
  private setPreGeometry = (preType: IState['preType']) => {
    if (this.preGeometry) this.scene.remove(this.preGeometry);
    let preParams: IState['preParams'] = DEFAULT_PARAMS.DEFAULT;

    if (!preType) {
      this.preGeometry = null;
    } else {
      preParams = DEFAULT_PARAMS[preType];
      this.preGeometry = createTypePreGeometry(preType);
      this.scene.add(this.preGeometry);
    }
    this.setState({ preType, prePos: DEFAULT_XYZ, preParams, movable: true, rotatable: false }, this.renderThree);
  }

  // 将预览几何体转为实体
  private preToEntity = () => {
    if (!this.preGeometry) return;
    const mesh = this.preGeometry.clone();
    mesh.material = new MeshLambertMaterial({ color: BASE_COLOR });
    this.addEntity(mesh);
    this.setState({ movable: true, rotatable: false }, this.renderThree);
  }

  // 添加实体
  private addEntity = (mesh: Mesh) => {
    this.scene.add(mesh);
    this.entities.push(mesh);
  }

  // 未选择提示
  private noSelTip = () => {
    const messages = document.body.querySelector('.ant-message-notice');
    if (!messages) message.warning('还未选择几何体');
    this.setState({ prePos: DEFAULT_XYZ, preParams: DEFAULT_PARAMS.DEFAULT });
  }
}
