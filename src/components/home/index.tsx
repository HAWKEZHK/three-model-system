import React, { Component, RefObject, createRef, ReactPropTypes } from 'react';
import { Layout, message } from 'antd';

import {
  Scene, WebGLRenderer, PerspectiveCamera, ArrowHelper, Raycaster,
  Group, Mesh, Geometry, PlaneBufferGeometry, MeshLambertMaterial, Vector2, Vector3,
  AmbientLight, DirectionalLight, LineSegments, LineBasicMaterial, ObjectLoader,
} from 'three';
import OrbitControls from 'three-orbitcontrols';
import TransformControls from 'three-transformcontrols';
import OBJExporter from 'three-obj-exporter';
import * as STLExporter from 'threejs-export-stl';

import { createPreThree, createTypePreThree, downLoader } from '@/common/helpers';
import { MAX_SIZE, STEP, CAMARE, DEFAULT_XYZ, DEFAULT_PARAMS, GEOMETRYS, BASE_COLOR, DRAFT_ENTITIES } from '@/common/constants';
import { ICommon, IChangeType, IGeometrys, IFileType } from '@/common/models';
import { Operation, ThreeDrawer } from '@/components';
import styles from './index.less';

const { Content, Sider } = Layout;
const { container, sider, content, close } = styles;

interface IState extends ICommon {
  collapsed: boolean; // 侧边栏状态
  drawerVisible: boolean; // 抽屉打开状态
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
  private preThree: Mesh | Group | null; // 预览几何体

  constructor(props: ReactPropTypes) {
    super(props);
    this.state = {
      collapsed: false,
      drawerVisible: false,
      preType: null,
      prePos: DEFAULT_XYZ,
      preRotate: DEFAULT_XYZ,
      preParams: DEFAULT_PARAMS.DEFAULT,
      changeType: null,
    };
    this.stageRef = createRef();
    this.scene = new Scene();
    this.camera = new PerspectiveCamera();
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.raycaster = new Raycaster();
    this.orbitControls = null;
    this.transformControls = null;
    this.entities = [];
    this.preThree = null;
  }
  componentDidMount() {
    this.initThree();
    this.setDraft();
    this.bindActions();
  }
  render() {
    const { collapsed, drawerVisible, preType, prePos, preRotate, preParams, changeType } = this.state;
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
          collapsedWidth="40"
          collapsible={true}
          reverseArrow={true}
          collapsed={collapsed}
          onCollapse={val => this.setState({ collapsed: val }, this.handleResize)}
        >
          {!collapsed && (
            <Operation
              preType={preType}
              prePos={prePos}
              preRotate={preRotate}
              preParams={preParams}
              changeType={changeType}
              setPreThree={this.setPreThree}
              update={this.update}
              confirm={this.confirm}
              downloadFile={this.downloadFile}
              openDrawer={() => this.setState({ drawerVisible: true })}
              cleanScene={this.cleanScene}
              entityNum={this.entities.length}
            />
          )}
        </Sider>
        <ThreeDrawer
          visible={drawerVisible}
          closeDrawer={() => this.setState({ drawerVisible: false })}
          addToPreThree={(preThree: Mesh | Group) => this.setPreThree('External', preThree)}
        />
      </Layout>
    );
  }

  // 获取草稿内容并渲染
  private setDraft = () => {
    const objectLoader = new ObjectLoader();
    const draftStr = localStorage.getItem(DRAFT_ENTITIES);
    if (!draftStr) return;
    let draft;
    try { draft = JSON.parse(draftStr); } catch (err) { draft = null; }
    draft && draft.forEach((item: any) => this.addEntity(objectLoader.parse(item)));
    this.renderThree();
  }

  // 绑定事件
  private bindActions = () => {
    const stage = this.stageRef.current;
    if (!stage) return;

    // 页面离开保存草稿
    window.onbeforeunload = () => {
      if (this.entities.length > 1) {
        this.entities.shift();
        localStorage.setItem(DRAFT_ENTITIES, JSON.stringify(this.entities));
      }
    };

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
    const { changeType } = this.state;
    if (!this.preThree || !(changeType === 'pos')) return;

    const intersect = this.getIntersect(clientX, clientY);
    if (!intersect) return;
    const { point, face } = intersect;
    this.update(
      'pos',
      point.clone()
        .add(face ? face.normal : new Vector3(0, 1, 0)) // 保证在 +y 方向 
        .divideScalar(STEP).floor().multiplyScalar(STEP) // 除以 STEP 取整再乘
        .addScalar(STEP / 2), // 每个位置增加 STEP / 2
    );
  }

  // 鼠标点击-添加或删除预览几何体
  private handleMouseUp = ({ button }: MouseEvent) => {
    const { changeType } = this.state;
    if (!this.preThree) return;

    if (button === 0 && changeType === 'pos') this.setState({ changeType: 'rotate' }, this.renderThree); // 左键-将预览几何体固定位置
    if (button === 2) this.setPreThree(null); // 右键-删除预览几何体
  }

  // 鼠标双击-实体转化为预览几何体
  private handledbClick = ({ clientX, clientY }: MouseEvent) => {
    if (this.preThree) return;
    const intersect = this.getIntersect(clientX, clientY);
    if (!intersect) return;

    const mesh = intersect.object as Mesh; // 选中的几何体

    // 实体数组中删除
    const index = this.entities.indexOf(mesh);
    if (index === 0) return;
    this.entities.splice(index, 1);
    this.scene.remove(mesh);

    // 参数设定
    const { geometry, position: prePos, rotation } = mesh as any;
    const { type: intersectType, parameters } = geometry;
    const preRotate = {
      x: rotation.x * 180 / Math.PI,
      y: rotation.y * 180 / Math.PI,
      z: rotation.z * 180 / Math.PI,
    };
    let preParams = {} as IState['preParams'], preType: IState['preType'];
    if (GEOMETRYS.map(({ type }) => type).includes(intersectType)) {
      preType = intersectType as IGeometrys;
      Object.keys(DEFAULT_PARAMS[preType]).forEach(key => preParams[key] = parameters[key]);
    } else {
      preType = 'External';
      preParams = DEFAULT_PARAMS.DEFAULT;
    }

    // 生成相同属性的预览几何体
    this.preThree = createPreThree(geometry);
    this.preThree.position.copy(prePos);
    this.preThree.rotation.copy(rotation);
    this.scene.add(this.preThree);
    this.setState({ preType, prePos, preRotate, preParams }, this.renderThree);
  }

  // canvas 渲染
  private renderThree = () => {
    const { changeType } = this.state;
    if (this.preThree) {
      this.scene.add(this.transformControls);
      if (changeType === 'rotate') {
        this.transformControls.attach(this.preThree);
      } else {
        this.transformControls.detach(this.preThree);
      }
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
      const { changeType } = this.state;
      stage.onmouseup = null;
      if (this.preThree && changeType === 'pos') this.preThree.visible = false; // 隐藏可移动的预览几何体
      this.renderThree();
    });
    this.orbitControls.addEventListener('end', () => {
      stage.onmouseup = this.handleMouseUp;
      if (this.preThree) this.preThree.visible = true;
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

  // 生成指定预览几何体
  private setPreThree = (preType: IState['preType'], preThree?: Mesh | Group) => {
    if (this.preThree) this.scene.remove(this.preThree);

    let preParams: IState['preParams'] = DEFAULT_PARAMS.DEFAULT;
    switch (preType) {
      case null: {
        this.preThree = null;
        break;
      }
      case 'External': {
        if (!preThree) return;
        this.preThree = preThree;
        this.scene.add(this.preThree);
        break;
      }
      default: {
        preParams = DEFAULT_PARAMS[preType];
        this.preThree = createTypePreThree(preType);
        this.scene.add(this.preThree);
        break;
      }
    }

    this.setState({
      preType,
      prePos: DEFAULT_XYZ,
      preRotate: DEFAULT_XYZ,
      preParams,
      changeType: 'pos',
    }, this.renderThree);
  }

  // 更新参数
  private update = (
    changeType: IChangeType,
    query: IState['prePos'] | IState['preRotate'] | IState['preParams'],
  ) => {
    if (!this.preThree) {
      this.noSelTip();
      return;
    }

    switch (changeType) {
      case 'pos': {
        const { x, y, z } = query as IState['prePos'];
        this.preThree.position.set(x, y, z);
        this.setState({ changeType, prePos: { x, y, z } }, this.renderThree);
        break;
      }
      case 'rotate': {
        const { x, y, z } = query as IState['preRotate'];
        const [radX, radY, radZ] = [x, y, z].map(item => item * Math.PI / 180);
        this.preThree.rotation.set(radX, radY, radZ);
        this.setState({ changeType, preRotate: { x, y, z } }, this.renderThree);
        break;
      }
      case 'params': {
        const preParams = query as IState['preParams'];
        const { preType, prePos, preRotate } = this.state;
        if (!preType) return;
        if (preType === 'External') {
          this.externalTip();
          return;
        }
        this.scene.remove(this.preThree);

        this.preThree = createTypePreThree(preType, preParams);
        const [radX, radY, radZ] = [preRotate.x, preRotate.y, preRotate.z].map(item => item * Math.PI / 180);
        this.preThree.position.set(prePos.x, prePos.y, prePos.z);
        this.preThree.rotation.set(radX, radY, radZ);

        this.scene.add(this.preThree);

        this.setState({ changeType, preParams }, this.renderThree);
        break;
      }
    }
  }

  // 保存参数
  private confirm = (type: IChangeType) => {
    if (!this.preThree) {
      this.noSelTip();
      return;
    }

    const { changeType } = this.state;
    switch (type) {
      case 'pos':
      case 'rotate': {
        this.setState({ changeType: changeType === type ? null : type }, this.renderThree);
        break;
      }
      case 'params': { // 转化为实体
        const preThree = this.preThree.clone() as any;
        const entityType = preThree.type as 'Mesh' | 'Group';
        if (entityType === 'Mesh') {
          preThree.material = new MeshLambertMaterial({ color: BASE_COLOR });
          this.addEntity(preThree);
        } else {
          preThree.children.forEach((item: Mesh) => {
            item.position.copy(preThree.position);
            this.addEntity(item.clone());
          });
        }
        this.preThree.position.add(new Vector3(STEP, 0, 0));
        this.setState({ changeType: 'pos' }, this.renderThree);
        break;
      }
    }
  }

  // 下载所有实体
  private downloadFile = (fileType: IFileType) => {
    if (this.entities.length <= 1) {
      message.warning('场景中未找到几何体~');
      return;
    }
    this.setPreThree(null);
    switch (fileType) {
      case 'OBJ': {
        const objExporter = new OBJExporter();
        const newScene = new Scene();
        this.entities.forEach((item, index) => {
          if (index === 0) return;
          newScene.add(item.clone());
        });
        downLoader(objExporter.parse(newScene), 'THREE-OBJ.obj');
        break;
      }
      case 'STL': {
        this.entities.forEach((item, index) => {
          if (index === 0) return;
          downLoader(STLExporter.fromMesh(item), `THREE-STL-${index}.stl`);
        });
        break;
      }
    }
  }

  // 清空所有几何体
  private cleanScene = () => {
    this.entities.forEach((item, index) => {
      if (index === 0) return;
      this.scene.remove(item);
    });
    this.entities.length = 1;
    localStorage.removeItem(DRAFT_ENTITIES);
    this.renderThree();
    message.success('清空完毕');
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
    this.setState({
      prePos: DEFAULT_XYZ,
      preRotate: DEFAULT_XYZ,
      preParams: DEFAULT_PARAMS.DEFAULT,
      changeType: null,
    });
  }

  // 外部模型不可编辑尺寸提示
  private externalTip = () => {
    const messages = document.body.querySelector('.ant-message-notice');
    if (!messages) message.warning('不支持修改外部模型参数');
    this.setState({
      preParams: DEFAULT_PARAMS.DEFAULT,
      changeType: null,
    });
  }
}
