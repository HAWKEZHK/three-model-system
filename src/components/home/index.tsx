import React, { Component, RefObject, createRef, ReactPropTypes } from 'react';
import { Layout } from 'antd';

import {
  Scene, WebGLRenderer, PerspectiveCamera, AxesHelper, Geometry, Vector3, LineSegments, LineBasicMaterial, AmbientLight, Mesh,
} from 'three';
import OrbitControls from 'three-orbitcontrols';
import TransformControls from 'three-transformcontrols';

import { MAX_SIZE, STEP, CAMARE } from '@/constants';
import { Operation } from '../operation';
import styles from './index.less';

const { Content, Sider } = Layout;
const { container, sider, content, close } = styles;

interface IState {
  collapsed: boolean; // 侧边栏状态
}
export class Home extends Component<{}, IState> {
  private stageRef: RefObject<HTMLDivElement>;
  private scene: Scene; // 场景
  private camera: PerspectiveCamera;  // 相机
  private renderer: WebGLRenderer; // 渲染器
  private orbitControls: any; // 轨道控制器
  private transformControls: any; // 传送控制器
  private previewGeometry: Mesh | null; // 预览几何体

  constructor(props: ReactPropTypes) {
    super(props);
    this.state = {
      collapsed: false,
    };
    this.stageRef = createRef();
    this.scene = new Scene();
    this.camera = new PerspectiveCamera();
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.orbitControls = null;
    this.transformControls = null;
    this.previewGeometry = null;
  }
  componentDidMount() {
    this.initThree();
    this.bindActions();

    // this.transformControls.attach(cube);
    // this.scene.add(new Mesh(
    //   (new PlaneBufferGeometry(1000, 1000)).rotateX(-Math.PI / 2),
    //   new MeshBasicMaterial({ visible: true }),
    // ));
  }
  render() {
    const { collapsed } = this.state;
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
          onCollapse={val => this.setState({ collapsed: val }, this.onResize)}
          reverseArrow={true}
        >
          {!collapsed && <Operation addGeometry={this.addGeometry} />}
        </Sider>
      </Layout>
    );
  }

  // 绑定事件
  private bindActions = () => {
    const stage = this.stageRef.current;
    if (!stage) return;

    window.onresize = this.onResize;
    stage.onmousemove = this.onStageMove;
  }

  // 大小变化重新渲染
  private onResize = () => {
    const stage = this.stageRef.current;
    if (!stage) return;

    const { offsetWidth: width, offsetHeight: height } = stage;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // 鼠标移动几何体随动
  private onStageMove = () => {
    if (!this.previewGeometry) return;
    console.info(this.previewGeometry.position);
  }

  // 添加几何体
  private addGeometry = (geometry: Mesh) => {
    this.previewGeometry = geometry;
    this.scene.add(geometry);
    this.renderThree();
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
    this.scene.add(new AmbientLight(0xFF0000)); // 环境光
  }

  // 初始化坐标系
  private initAxis = () => {
    const Axis = new AxesHelper(MAX_SIZE);
    this.scene.add(Axis);
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
        new LineBasicMaterial({ color: '#000', opacity: .15, transparent: true }),
      )
    );
  }

  // 初始化轨道控制器
  private initOrbitControls = () => {
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.maxDistance = 2 * MAX_SIZE;
    this.orbitControls.minDistance = 2 * STEP;
    this.orbitControls.addEventListener('change', this.renderThree);
  }

  // 初始化轨道控制器
  private initTransformControls = () => {
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.addEventListener('change', this.renderThree);
    this.scene.add(this.transformControls);
  }
}
