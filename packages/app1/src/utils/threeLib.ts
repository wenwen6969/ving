import * as THREE from 'three';

/**初始化引擎 */
export function initRenderer(cWidth: number, cHeight: number, container: HTMLElement, callback: () => void): THREE.WebGLRenderer {
	const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
	renderer.setSize(cWidth, cHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	container.appendChild(renderer.domElement);
	callback();
	return renderer;
}

/**初始化场景 */
export function initScene(): THREE.Scene {
	const scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0x000000, 0, 10000);
	return scene;
}

/**初始化相机 */
export function initCamera(cWidth: number, cHeight: number): THREE.Camera {
	/**视角 */
	const fov = 15;
	const depth = 1400;
	const cameraTarget = new THREE.Vector3(0, 0, 0);
	const distance = cWidth / 2 / Math.tan(Math.PI / 12);
	const zAxisNumber = Math.floor(distance - depth / 2);
	const camera = new THREE.PerspectiveCamera(fov, cWidth / cHeight, 1, 30000);
	camera.position.set(0, 0, zAxisNumber);
	camera.lookAt(cameraTarget);
	return camera;
}

/**初始化光源 */
export function initLight(scene: THREE.Scene) {
	const ambientLight = new THREE.AmbientLight(0xffffff, 1);
	const bottomLight = new THREE.PointLight(0xcccccc);
	bottomLight.position.set(0, 100, -200);
	scene.add(ambientLight);
	scene.add(bottomLight);
}
