import * as THREE from 'three';
import _ from 'lodash';
/**初始化球体 */
export function initSphere() {
	const meterial = new THREE.MeshPhongMaterial();
	meterial.map = new THREE.TextureLoader().load(new URL('@/assets/images/earth_bg.png', import.meta.url).href);
	meterial.blendDstAlpha = 1;
	//几何体
	const sphereGeometry = new THREE.SphereGeometry(50, 64, 32);
	//模型
	const sphere = new THREE.Mesh(sphereGeometry, meterial);
	return { sphereGeometry, sphere };
}

export function initStar(initZposition: number, scene: THREE.Scene, width: number, height: number, depth: number, zAxisNumber: number) {
	const geometry = new THREE.BufferGeometry();
	const vertices: number[] = [];
	const pointsGeometry: any[] = [];
	const textureLoader = new THREE.TextureLoader();
	const sprite1 = textureLoader.load(new URL('@/assets/images/starflake1.png', import.meta.url).href);
	const sprite2 = textureLoader.load(new URL('@/assets/images/starflake2.png', import.meta.url).href);
	const parameters = [
		[[0.6, 100, 0.75], sprite1, 50],
		[[0, 0, 1], sprite2, 20],
	];
	const materials: any[] = [];
	// 初始化500个节点
	for (let i = 0; i < 500; i++) {
		/**
		 * const x: number = Math.random() * 2 * width - width
		 * 等价
		 * THREE.MathUtils.randFloatSpread(width)
		 */
		const x: number = THREE.MathUtils.randFloatSpread(width);
		const y: number = _.random(0, height / 2);
		const z: number = _.random(-depth / 2, zAxisNumber);
		vertices.push(x, y, z);
	}

	geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

	// 创建2种不同的材质的节点（500 * 2）
	for (let i = 0; i < parameters.length; i++) {
		const color = parameters[i][0];
		const sprite = parameters[i][1] as THREE.Texture;
		const size = parameters[i][2] as number;

		materials[i] = new THREE.PointsMaterial({
			size,
			map: sprite,
			blending: THREE.AdditiveBlending,
			depthTest: true,
			transparent: true,
		});
		materials[i].color.setHSL(color[0], color[1], color[2]);
		const particles = new THREE.Points(geometry, materials[i]);
		particles.rotation.x = Math.random() * 0.2 - 0.15;
		particles.rotation.z = Math.random() * 0.2 - 0.15;
		particles.rotation.y = Math.random() * 0.2 - 0.15;
		particles.position.setZ(initZposition);
		pointsGeometry.push(particles);
		scene.add(particles);
	}
	return pointsGeometry;
}

export function starMove(
	zprogress: number,
	zAxisNumber: number,
	depth: number,
	particles_init_position: number,
	zprogress_second: number,
	particles_first: any[],
	particles_second: any[],
	materials: any,
	parameters: any
) {
	const time = Date.now() * 0.00005;
	zprogress += 1;
	zprogress_second += 1;

	if (zprogress >= zAxisNumber + depth / 2) {
		zprogress = particles_init_position;
	} else {
		particles_first.forEach((item) => {
			item.position.setZ(zprogress);
		});
	}
	if (zprogress_second >= zAxisNumber + depth / 2) {
		zprogress_second = particles_init_position;
	} else {
		particles_second.forEach((item) => {
			item.position.setZ(zprogress_second);
		});
	}

	for (let i = 0; i < materials.length; i++) {
		const color = parameters[i][0];

		const h = ((360 * (color[0] + time)) % 360) / 360;
		materials[i].color.setHSL(color[0], color[1], parseFloat(h.toFixed(2)));
	}
}

/**初始化流动路径 */
export function initTubeRoute(scene: THREE.Scene, route?: any, geometryWidth?: number, geometryHeigh?: number) {
	const curve = new THREE.CatmullRomCurve3(route, false);
	const tubeGeometry = new THREE.TubeGeometry(curve, 100, 2, 50, false);
	const tubeMaterial = new THREE.MeshBasicMaterial({
		// color: '0x4488ff',
		opacity: 0,
		transparent: true,
	});
	const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
	scene.add(tube);

	const clondGeometry = new THREE.PlaneGeometry(geometryWidth, geometryHeigh);
	const textureLoader = new THREE.TextureLoader();
	const cloudTexture = textureLoader.load(new URL('@/assets/images/cloud.png', import.meta.url).href);
	const clondMaterial = new THREE.MeshBasicMaterial({
		map: cloudTexture,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true,
	});
	const cloud = new THREE.Mesh(clondGeometry, clondMaterial);
	scene.add(cloud);
	return {
		cloud,
		curve,
	};
}
/**初始化云的运动函数 */
export function initCloudMove(cloudParameter: any, speed: number, scaleSpeed = 0.0006, maxScale = 1, startScale = 0) {
	let cloudProgress = 0;
	return () => {
		if (startScale < maxScale) {
			startScale += scaleSpeed;
			cloudParameter.cloud.scale.setScalar(startScale);
		}
		if (cloudProgress > 1) {
			cloudProgress = 0;
			startScale = 0;
		} else {
			cloudProgress += speed;
			if (cloudParameter.curve) {
				const point = cloudParameter.curve.getPoint(cloudProgress);
				if (point && point.x) {
					cloudParameter.cloud.position.set(point.x, point.y, point.z);
				}
			}
		}
	};
}
