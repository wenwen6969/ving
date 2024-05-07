<template>
	<div class="login-container">
		<div id="login-three-container"></div>
		<div class="login-plane">
			<div class="login-plane-container">
				<img class="login-plane-human" src="@/assets/images/login_human.png" alt="" />
				<div class="login-plane-title">
					xx传媒 -- 登陆
					<img class="login-plane-title-line" src="@/assets/images/login_horizontal_line.png" alt="" />
				</div>
				<div class="login-plane-form">
					<el-form ref="formRef" :model="formField" :rules="formRules">
						<el-form-item prop="user">
							<el-input v-model="formField.user" placeholder="用户名 / 账号" type="text"></el-input>
						</el-form-item>
						<el-form-item prop="pass">
							<el-input v-model="formField.pass" placeholder="密码" type="password"></el-input>
						</el-form-item>
						<div class="login-code-container">
							<el-form-item style="width: 50%" prop="code">
								<el-input v-model="formField.code" placeholder="验证码" type="text"></el-input>
							</el-form-item>
							<div class="login-code" @click="getValidateCodeHandle">
								<img :src="codeSrc" />
							</div>
						</div>
						<el-form-item prop="autoLogin">
							<el-checkbox v-model="formField.whetherAutoLogin" label="自动登陆"></el-checkbox>
						</el-form-item>
					</el-form>
					<el-button style="width: 100%" type="primary" @click="submitForm">登录</el-button>
				</div>
			</div>
		</div>
		<div class="login-ground"></div>
	</div>
</template>

<script lang="ts">
import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { defineComponent, onMounted, ref, reactive, toRefs, unref } from 'vue';
import _ from 'lodash';
import { ElMessage } from 'element-plus';
import { initRenderer, initCamera, initScene, initLight } from '@/utils/threeLib';
import { initSphere, initStar, starMove, initTubeRoute, initCloudMove } from '@/utils/GeometryLib';
import { testApi } from '@/api/test';

export default defineComponent({
	setup() {
		// 容器
		let container: HTMLElement;
		// 声明视口宽度
		let width: number;
		// 声明视口高度
		let height: number;
		// 盒模型的深度
		const depth = 1400;
		// 声明场景
		let scene: THREE.Scene;
		// 声明球组
		let Sphere_Group: any;
		// 声明球体几何
		let sphereGeometry: any;
		// 声明完整球
		let sphere: any;
		// 声明相机
		let camera: any;
		// 声明相机在z轴的位置
		let zAxisNumber: number;
		// 声明点材质
		let materials: any = [];
		// 声明点的参数
		let parameters: any;
		// 声明点在z轴上移动的进度
		let zprogress: number;
		// 声明同上（第二个几何点）
		let zprogress_second: number;
		// 声明粒子1
		let particles_first: any[];
		// 声明粒子1
		let particles_second: any[];
		// 声明粒子1的初始化位置
		let particles_init_position: number;
		// 声明流动的云对象1（包含路径、云实例）
		let cloudParameter_first: any;
		// 声明流动的云对象2（包含路径、云实例）
		let cloudParameter_second: any;
		// 声明云流动的渲染函数1
		let renderCloudMove_first: any;
		// 声明云流动的渲染函数1
		let renderCloudMove_second: any;
		// 声明性能监控
		let stats: any = new Stats();
		// 声明渲染器
		let renderer: THREE.WebGLRenderer;
		// 声明调试工具
		let gui = new GUI();

		// 表单对象
		const formRef = ref(null);

		// 其他状态
		const state = reactive({
			codeSrc: '',
			codetoken: '',
		});

		// 响应式对象 - 表单对象
		const formField = reactive({
			user: '',
			pass: '',
			code: '',
			whetherAutoLogin: '',
		});

		// 表单校验规则
		const formRules = {
			user: [{ required: true, message: '请输入用户名账号', trigger: 'blur' }],
			pass: [{ required: true, message: '请输入密码', trigger: 'blur' }],
			code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
		};

		onMounted(() => {
			container = document.getElementById('login-three-container') as HTMLElement;
			width = container.clientWidth;
			height = container.clientHeight;
			scene = initScene();
			initSceneBg();
			camera = initCamera(width, height);
			initLight(scene);
			sphereGeometry = initSphere().sphereGeometry;
			sphere = initSphere().sphere;
			initSphereGroup();
			particles_init_position = -zAxisNumber - depth / 2;
			zprogress = particles_init_position;
			zprogress_second = particles_init_position * 2;
			particles_first = initStar(particles_init_position, scene, width, height, depth, zAxisNumber);
			particles_second = initStar(zprogress_second, scene, width, height, depth, zAxisNumber);
			cloudParameter_first = initTubeRoute(
				scene,
				[new THREE.Vector3(-width / 10, 0, -depth / 2), new THREE.Vector3(-width / 4, height / 8, 0), new THREE.Vector3(-width / 4, 0, zAxisNumber)],
				400,
				200
			);
			cloudParameter_second = initTubeRoute(
				scene,
				[new THREE.Vector3(width / 8, height / 8, -depth / 2), new THREE.Vector3(width / 8, height / 8, zAxisNumber)],
				200,
				100
			);
			/**声明渲染器 */
			renderer = initRenderer(width, height, container, rendererCB);
			// 控制器必须放在renderer函数后面
			initOrbitControls();
			animate();
			initGUI();
			const data = {
				name: '123',
			};
			testApi(data).then((res) => {
				console.log(res);
			});
			// const axesHelper = new THREE.AxesHelper(2000)
			// scene.add(axesHelper)
		});

		function rendererCB() {
			container.appendChild(stats.dom);
			renderCloudMove_first = initCloudMove(cloudParameter_first, 0.0002);
			renderCloudMove_second = initCloudMove(cloudParameter_second, 0.0008, 0.001);
		}

		//gui参数
		function Params() {
			this.color = '#000';
			this.length = 10;
			this.size = 3;
			this.visible = true;
			this.x = 0;
			this.y = 0;
			this.z = 100;
			this.widthSegments = 64;
			this.heightSegments = 32;
			this.radius = 16;
		}

		// 初始化gui
		const initGUI = () => {
			const params = new Params();
			gui.add(params, 'x', -1500, 1500).onChange((x: number) => {
				//点击颜色面板，e为返回的10进制颜色
				Sphere_Group.position.x = x;
			});
			gui.add(params, 'y', -50, 1500).onChange((y: number) => {
				//点击颜色面板，e为返回的10进制颜色
				Sphere_Group.position.y = y;
			});
			gui.add(params, 'z', -200, 1000).onChange((z: number) => {
				//点击颜色面板，e为返回的10进制颜色
				Sphere_Group.position.z = z;
			});
			gui.add(params, 'widthSegments', 0, 64).onChange((widthSegments: number) => {
				//点击颜色面板，e为返回的10进制颜色
				sphereGeometry.parameters.widthSegments = widthSegments;
			});
			gui.add(params, 'heightSegments', 0, 32).onChange((heightSegments: number) => {
				//点击颜色面板，e为返回的10进制颜色
				sphereGeometry.parameters.heightSegments = heightSegments;
			});
			gui.add(params, 'radius', 5, 30).onChange((radius: number) => {
				//点击颜色面板，e为返回的10进制颜色
				sphereGeometry.parameters.radius = radius;
				renderer.render(scene, camera);
			});
			gui.add(params, 'visible').onChange(() => {
				//这是一个单选框，因为params.visible是一个布尔值，e返回所选布尔值
				// points.visible = e
			});
			gui.addColor(params, 'color').onChange(() => {
				//点击颜色面板，e为返回的10进制颜色
				// pointsMaterial.color.set(e)
			});
		};

		// 初始化背景（盒模型背景，视角在盒子里面，看到的是盒子内部）
		const initSceneBg = () => {
			new THREE.TextureLoader().load(new URL('@/assets/images/sky.png', import.meta.url).href, (texture) => {
				const geometry = new THREE.BoxGeometry(width, height, depth); // 创建一个球形几何体 SphereGeometry
				const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }); // 创建基础为网格基础材料
				const mesh = new THREE.Mesh(geometry, material);
				scene.add(mesh);
			});
		};

		// 初始化轨道控制器
		const initOrbitControls = () => {
			const controls = new OrbitControls(camera, renderer.domElement);
			// enabled设置为true是可以使用鼠标控制视角
			controls.enabled = false;
			controls.update();
		};

		// 初始化组 --- 球体
		const initSphereGroup = () => {
			Sphere_Group = new THREE.Group();
			Sphere_Group.add(sphere);
			Sphere_Group.position.x = -400;
			Sphere_Group.position.y = 200;
			Sphere_Group.position.z = -200;
			scene.add(Sphere_Group);
		};

		// 渲染星球的自转
		const renderSphereRotate = () => {
			if (sphere) {
				Sphere_Group.rotateY(0.001);
			}
		};

		//动画刷新
		const animate = () => {
			requestAnimationFrame(animate);
			renderSphereRotate();
			starMove(zprogress, zAxisNumber, depth, particles_init_position, zprogress_second, particles_first, particles_second, materials, parameters);
			renderCloudMove_first();
			renderCloudMove_second();
			renderer.render(scene, camera);
		};

		// 获取验证码
		const getValidateCodeHandle = async () => {
			// 请求获取验证码 并设置验证码的图片以及验证码token
			state.codeSrc = '';
			state.codetoken = '';
		};

		// 提交表单
		const submitForm = () => {
			const form: any = unref(formRef);
			if (!form) return;
			form.validate((valid: any) => {
				if (valid) {
					submitHandle();
				} else {
					ElMessage.warning({
						message: '随便输入用户名、密码、验证码即可登陆',
						type: 'warning',
					});
				}
			});
		};

		// 提交请求
		const submitHandle = async () => {
			// const params = {
			// 	password: formField.pass,
			// 	username: formField.user,
			// 	verifyCode: formField.code,
			// };
			// 提交登陆请求
		};

		const refsState = toRefs(state);
		return {
			...refsState,
			formRules,
			formField,
			submitForm,
			formRef,
			getValidateCodeHandle,
		};
	},
});
</script>

<style lang="scss" scoped>
@import 'index.scss';
</style>
