import React, { Component, RefObject, createRef, ReactPropTypes } from 'react';
import {
  Scene, WebGLRenderer, PerspectiveCamera, AxisHelper, Geometry, Vector3, LineSegments, LineBasicMaterial, AmbientLight,
} from 'three';
import OrbitControls from 'three-orbitcontrols';

import { CubeGeometry, Mesh, MeshLambertMaterial } from 'three';
import styles from './index.less';
import { MAX_SIZE, STEP, CAMARE } from '@/constants';

const { container } = styles;

export class Stage extends Component {
  private stageRef: RefObject<HTMLDivElement>;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private orbitControls: any;

  constructor(props: ReactPropTypes) {
    super(props);
    this.stageRef = createRef();
    this.scene = new Scene();
    this.camera = new PerspectiveCamera();
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.orbitControls = null;
  }
  componentDidMount() {
    const cube = new Mesh(
      new CubeGeometry(100, 100, 100),
      new MeshLambertMaterial(),
    );
    this.scene.add(cube);

    this.initThree();
  }
  render() {
    return <div className={container} ref={this.stageRef} />;
  }

  // 初始化
  private initThree = () => {
    const stage = this.stageRef.current;
    if (!stage) return;
    const { offsetWidth: width, offsetHeight: height } = stage;

    this.initCamera(width / height);
    this.initOrbitControls();
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
    const Axis = new AxisHelper(MAX_SIZE);
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
    this.orbitControls.addEventListener('change', this.renderThree);
  }

  // canvas 渲染
  private renderThree = () => this.renderer.render(this.scene, this.camera);
}
