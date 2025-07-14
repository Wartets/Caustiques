const config = {
	cupHeight: 9.6,
	cupRadius: 4.1,
	lightHeight: 10.1,
	lightAngle: 83,
	rayCount: 72000,
	maxReflections: 5,
	attenuation: 0.8,
	tiltX: -15,
	tiltY: 1,
	intensity0: 0.9,
	radius: 0.55,
	minReflections: 0,
	lightX: -1,
	lightY: -1.6,
	frameSkip: 3,
    currentFrame: 0
};

const canvas = document.getElementById('causticCanvas');
const ctx = canvas.getContext('2d');
const lightAngleSlider = document.getElementById('lightAngle');
const lightAngleValue = document.getElementById('lightAngleValue');
const cupRadiusSlider = document.getElementById('cupRadius');
const cupRadiusValue = document.getElementById('cupRadiusValue');
const cupHeightSlider = document.getElementById('cupHeight');
const cupHeightValue = document.getElementById('cupHeightValue');
const restartBtn = document.getElementById('restartBtn');
const rayCountSlider = document.getElementById('rayCount');
const rayCountValue = document.getElementById('rayCountValue');
const tiltXSlider = document.getElementById('tiltX');
const tiltXValue = document.getElementById('tiltXValue');
const tiltYSlider = document.getElementById('tiltY');
const tiltYValue = document.getElementById('tiltYValue');
const attenuationSlider = document.getElementById('attenuation');
const attenuationValue = document.getElementById('attenuationValue');
const lightHeightSlider = document.getElementById('lightHeight');
const lightHeightValue = document.getElementById('lightHeightValue');
const maxReflectionsSlider = document.getElementById('maxReflections');
const maxReflectionsValue = document.getElementById('maxReflectionsValue');
const pointRadiusSlider = document.getElementById('pointRadius');
const pointRadiusValue = document.getElementById('pointRadiusValue');
const intensity0Slider = document.getElementById('intensity0');
const intensity0Value = document.getElementById('intensity0Value');
const reflectionMinSlider = document.getElementById('reflectionMin');
const reflectionMaxSlider = document.getElementById('reflectionMax');
const reflectionMinValue = document.getElementById('reflectionMinValue');
const reflectionMaxValue = document.getElementById('reflectionMaxValue');
const lightXSlider = document.getElementById('lightX');
const lightXValue = document.getElementById('lightXValue');
const lightYSlider = document.getElementById('lightY');
const lightYValue = document.getElementById('lightYValue');

let scene, camera, renderer, controls;
let cupMesh, lightCone, groundMesh;
let directionalLight;

lightAngleSlider.addEventListener('input', () => {
	config.lightAngle = parseInt(lightAngleSlider.value);
	lightAngleValue.textContent = `${config.lightAngle}°`;
	startSimulation();
});

cupHeightSlider.addEventListener('input', () => {
	config.cupHeight = parseFloat(cupHeightSlider.value);
	cupHeightValue.textContent = config.cupHeight.toFixed(1);
	startSimulation();
});

cupRadiusSlider.addEventListener('input', () => {
	config.cupRadius = parseFloat(cupRadiusSlider.value);
	cupHeightValue.textContent = config.cupRadius.toFixed(1);
	startSimulation();
});

rayCountSlider.addEventListener('input', () => {
	config.rayCount = parseInt(rayCountSlider.value) * 1000;
	rayCountValue.textContent = rayCountSlider.value;
	startSimulation();
});

tiltXSlider.addEventListener('input', () => {
	config.tiltX = parseInt(tiltXSlider.value);
	tiltXValue.textContent = `${config.tiltX}°`;
	startSimulation();
});

tiltYSlider.addEventListener('input', () => {
	config.tiltY = parseInt(tiltYSlider.value);
	tiltYValue.textContent = `${config.tiltY}°`;
	startSimulation();
});

attenuationSlider.addEventListener('input', () => {
	config.attenuation = parseInt(attenuationSlider.value) / 100;
	attenuationValue.textContent = config.attenuation.toFixed(2);
	startSimulation();
});

lightHeightSlider.addEventListener('input', () => {
	config.lightHeight = parseFloat(lightHeightSlider.value);
	lightHeightValue.textContent = config.lightHeight.toFixed(1);
	startSimulation();
});

maxReflectionsSlider.addEventListener('input', () => {
	const newMax = parseInt(maxReflectionsSlider.value);
	config.maxReflections = newMax;
	maxReflectionsValue.textContent = newMax;
	
	reflectionMinSlider.max = newMax;
	reflectionMaxSlider.max = newMax;
	
	if (config.displayMinReflections > newMax) {
		config.displayMinReflections = newMax;
		reflectionMinSlider.value = newMax;
		reflectionMinValue.textContent = newMax;
	}
	if (config.displayMaxReflections > newMax) {
		config.displayMaxReflections = newMax;
		reflectionMaxSlider.value = newMax;
		reflectionMaxValue.textContent = newMax;
	}
	
	reflectionMinValue.textContent = config.displayMinReflections;
	reflectionMaxValue.textContent = config.displayMaxReflections;
	
	startSimulation();
});

pointRadiusSlider.addEventListener('input', () => {
	config.radius = parseFloat(pointRadiusSlider.value);
	pointRadiusValue.textContent = config.radius.toFixed(1);
	startSimulation();
});

intensity0Slider.addEventListener('input', () => {
	config.intensity0 = parseFloat(intensity0Slider.value);
	intensity0Value.textContent = config.intensity0.toFixed(2);
	startSimulation();
});

reflectionMinSlider.addEventListener('input', () => {
	config.displayMinReflections = parseInt(reflectionMinSlider.value);
	reflectionMinValue.textContent = config.displayMinReflections;
	if (config.displayMinReflections > config.displayMaxReflections) {
		config.displayMaxReflections = config.displayMinReflections;
		reflectionMaxSlider.value = config.displayMaxReflections;
		reflectionMaxValue.textContent = config.displayMaxReflections;
	}
	startSimulation();
});

reflectionMaxSlider.addEventListener('input', () => {
	config.displayMaxReflections = parseInt(reflectionMaxSlider.value);
	reflectionMaxValue.textContent = config.displayMaxReflections;
	if (config.displayMaxReflections < config.displayMinReflections) {
		config.displayMinReflections = config.displayMaxReflections;
		reflectionMinSlider.value = config.displayMinReflections;
		reflectionMinValue.textContent = config.displayMinReflections;
	}
	startSimulation();
});

lightXSlider.addEventListener('input', () => {
	config.lightX = parseFloat(lightXSlider.value);
	lightXValue.textContent = config.lightX.toFixed(1);
	startSimulation();
});

lightYSlider.addEventListener('input', () => {
	config.lightY = parseFloat(lightYSlider.value);
	lightYValue.textContent = config.lightY.toFixed(1);
	startSimulation();
});

restartBtn.addEventListener('click', startSimulation);

function rotateVector(v, ax, ay) {
	const rx = ax * Math.PI / 180;
	const ry = ay * Math.PI / 180;
	
	const y1 = v[1] * Math.cos(rx) - v[2] * Math.sin(rx);
	const z1 = v[1] * Math.sin(rx) + v[2] * Math.cos(rx);
	
	const x1 = v[0] * Math.cos(ry) - z1 * Math.sin(ry);
	const z2 = v[0] * Math.sin(ry) + z1 * Math.cos(ry);
	
	return [x1, y1, z2];
}

function startSimulation() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawCupBottom();
	
	if (scene) updateThreeScene();
	
	for (let i = 0; i < config.rayCount; i++) {
		simulateLightRay();
	}
}

function drawCupBottom() {
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;
	const radius = Math.min(canvas.width, canvas.height) * 0.4001;
	
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
	ctx.fillStyle = '#000';
	ctx.fill();
}

function simulateLightRay() {
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;
	const displayRadius = Math.min(canvas.width, canvas.height) * 0.4;
	
	const angle = Math.random() * Math.PI * 2;
	const coneAngle = config.lightAngle * Math.PI / 180;
	const elevation = Math.random() * coneAngle;
	
	const dirX = Math.sin(elevation) * Math.cos(angle);
	const dirY = Math.sin(elevation) * Math.sin(angle);
	const dirZ = -Math.cos(elevation);
	
	const rotated = rotateVector([dirX, dirY, dirZ], config.tiltX, config.tiltY);
	let dx = rotated[0];
	let dy = rotated[1];
	let dz = rotated[2];
	
	const startX = config.lightX;
	const startY = config.lightY;
	const startZ = config.lightHeight;
	
	let x = startX;
	let y = startY;
	let z = startZ;
	
	let intensity = config.intensity0;
	let reflectionCount = 0;
	
	const startDistance = Math.sqrt(config.lightX * config.lightX + config.lightY * config.lightY);
	
	if (startDistance > config.cupRadius) {
		const tToCylinder = intersectCylinder(startX, startY, startZ, dx, dy, dz);
		if (tToCylinder <= 0) {
			return;
		}
	}
	
	while (reflectionCount < config.maxReflections && intensity > 0.001) {
		const tToCylinder = intersectCylinder(x, y, z, dx, dy, dz);
		const tToBottom = intersectBottom(x, y, z, dx, dy, dz);
		
		if (tToBottom > 0 && (tToCylinder <= 0 || tToBottom < tToCylinder)) {
			const hitX = x + dx * tToBottom;
			const hitY = y + dy * tToBottom;
			
			drawImpactPoint(hitX, hitY, intensity, reflectionCount);
			break;
		} else if (tToCylinder > 0) {
			x = x + dx * tToCylinder;
			y = y + dy * tToCylinder;
			z = z + dz * tToCylinder;
			
			const nx = x / config.cupRadius;
			const ny = y / config.cupRadius;
			const nz = 0;
			
			const dot = dx * nx + dy * ny + dz * nz;
			dx = dx - 2 * dot * nx;
			dy = dy - 2 * dot * ny;
			dz = dz - 2 * dot * nz;
			
			intensity *= config.attenuation;
			reflectionCount++;
		} else {
			break;
		}
	}
}

function intersectCylinder(x, y, z, dx, dy, dz) {
	// Équation quadratique pour l'intersection cylindre
	const a = dx * dx + dy * dy;
	const b = 2 * (x * dx + y * dy);
	const c = x * x + y * y - config.cupRadius * config.cupRadius;
	
	const discriminant = b * b - 4 * a * c;
	
	if (discriminant < 0) {
		return -1;
	}
	
	const sqrtDisc = Math.sqrt(discriminant);
	const t1 = (-b - sqrtDisc) / (2 * a);
	const t2 = (-b + sqrtDisc) / (2 * a);
	
	let t = -1;
	if (t1 > 0) t = t1;
	if (t2 > 0 && (t < 0 || t2 < t)) t = t2;
	
	if (t > 0) {
		const hitZ = z + dz * t;
		if (hitZ < 0 || hitZ > config.cupHeight) {
			return -1;
		}
	}
	
	return t;
}

function intersectBottom(x, y, z, dx, dy, dz) {
	if (Math.abs(dz) < 1e-6) return -1;
	
	const t = -z / dz;
	if (t < 0) return -1;
	
	const hitX = x + dx * t;
	const hitY = y + dy * t;
	const r2 = hitX * hitX + hitY * hitY;
	
	if (r2 > config.cupRadius * config.cupRadius) {
		return -1; 
	}
	
	return t;
}

function drawImpactPoint(x, y, intensity, reflectionCount) {
	if (reflectionCount < config.displayMinReflections || reflectionCount > config.displayMaxReflections) {
		return;
	}

	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;
	const displayRadius = Math.min(canvas.width, canvas.height) * 0.4;
	
	const canvasX = centerX + x * (displayRadius / config.cupRadius);
	const canvasY = centerY + y * (displayRadius / config.cupRadius);
	
	const opacity = intensity;
	
	let color;
	switch(reflectionCount) {
		case 0:
			color = `rgba(100, 200, 255, ${opacity})`;
			break;
		case 1:
			color = `rgba(100, 255, 200, ${opacity})`;
			break;
		case 2:
			color = `rgba(255, 255, 100, ${opacity})`;
			break;
		case 3:
			color = `rgba(255, 200, 100, ${opacity})`;
			break;
		case 4:
			color = `rgba(255, 150, 100, ${opacity})`;
			break;
		case 5:
			color = `rgba(255, 100, 100, ${opacity})`;
			break;
		default: 
			const hue = 270 + (reflectionCount - 5) * 10;
			color = `hsla(${hue}, 100%, 65%, ${opacity})`;
	}
	
	ctx.beginPath();
	ctx.arc(canvasX, canvasY, config.radius, 0, Math.PI * 2);
	ctx.fillStyle = color;
	ctx.fill();
}

function initSliderValuePositions() {
	document.querySelectorAll('.slider-container').forEach(container => {
		const slider = container.querySelector('input[type="range"]');
		const valueDisplay = container.querySelector('.slider-value');
		
		if (!slider || !valueDisplay) return;

		updateSliderValuePosition(slider, valueDisplay);

		slider.addEventListener('input', () => {
			updateSliderValuePosition(slider, valueDisplay);
		});
	});
}

function updateSliderValuePosition(slider, valueDisplay) {
	const ratio = (slider.value - slider.min) / (slider.max - slider.min);
	const thumbPosition = ratio * slider.offsetWidth;
	valueDisplay.style.left = `${thumbPosition}px`;
}

function initThreeScene() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	
	camera = new THREE.PerspectiveCamera(100, 1, 0.1, 1000);
	camera.position.set(0, 20, 15); 
	
	renderer = new THREE.WebGLRenderer({ 
		canvas: document.getElementById('threeCanvas'),
		antialias: true,
		alpha: true
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); 
	scene.add(ambientLight);
	
	pointLight = new THREE.PointLight(0xffffff, config.intensity0 * 150, 0);
	pointLight.castShadow = true;
	pointLight.shadow.mapSize.width = 2048;
	pointLight.shadow.mapSize.height = 2048;
	pointLight.shadow.camera.near = 0.5;
	pointLight.shadow.camera.far = 100;

	scene.add(pointLight);
	
	createObjects();
	updateThreeScene();
	
	function animate() {
		requestAnimationFrame(animate);
		controls.update();
		renderer.render(scene, camera);
		config.currentFrame++;
		if (config.currentFrame % config.frameSkip !== 0) return;
	}
	animate();
}

function createObjects() {
	const cupMaterial = new THREE.MeshPhongMaterial({
		color: 0xf44336,
		transparent: true,
		opacity: 1,
		side: THREE.DoubleSide
	});
	
	const cupGeometry = new THREE.CylinderGeometry(
		config.cupRadius, 
		config.cupRadius, 
		config.cupHeight,
		64, 1, true
	);
	cupMesh = new THREE.Mesh(cupGeometry, cupMaterial);
	cupMesh.position.set(0, config.cupHeight / 2, 0);
	cupMesh.castShadow = true;
	cupMesh.receiveShadow = false;
	scene.add(cupMesh);
	
	const bottomGeometry = new THREE.CircleGeometry(config.cupRadius, 64);
	const bottomMesh = new THREE.Mesh(bottomGeometry, cupMaterial);
	bottomMesh.rotation.x = -Math.PI / 2;
	bottomMesh.position.y = 1e-2;
	bottomMesh.castShadow = true;
	bottomMesh.receiveShadow = false;
	scene.add(bottomMesh);
	
	const handleThickness = config.cupRadius * 0.3;
	const handleWidth = config.cupRadius * 1.5;
	const handleHeight = config.cupHeight * 0.6;
	
	const handleCurve = new THREE.CubicBezierCurve3(
		new THREE.Vector3(-config.cupRadius, config.cupHeight * 0.3, 0),
		new THREE.Vector3(-handleWidth, config.cupHeight * 0.4, 0),
		new THREE.Vector3(-handleWidth, config.cupHeight * 0.6, 0),
		new THREE.Vector3(-config.cupRadius, config.cupHeight * 0.7, 0)
	);
	
	const handleTubeGeometry = new THREE.TubeGeometry(
		handleCurve,
		32,
		handleThickness,
		16,
		false
	);
	
	const handleMesh = new THREE.Mesh(handleTubeGeometry, cupMaterial);
	handleMesh.castShadow = true;
	scene.add(handleMesh);

	const groundGeometry = new THREE.PlaneGeometry(100, 100);
	const groundMaterial = new THREE.MeshPhongMaterial({
		color: 0xffffff,
		side: THREE.FrontSide,
		shininess: 30
	});
	groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
	groundMesh.rotation.x = -Math.PI / 2;
	groundMesh.position.y = 0;
	groundMesh.receiveShadow = true;
	groundMesh.scale.set(2, 2, 2);
	scene.add(groundMesh);
	
	lightCone = new THREE.Group();
	scene.add(lightCone);
}

function updateThreeScene() {
	cupMesh.geometry.dispose();
	cupMesh.geometry = new THREE.CylinderGeometry(
		config.cupRadius, 
		config.cupRadius, 
		config.cupHeight,
		64, 1, true
	);
	cupMesh.position.set(0, config.cupHeight / 2 + 1e-2, 0);
	
	scene.children.forEach(child => {
		if(child.geometry instanceof THREE.CircleGeometry) {
			child.geometry.dispose();
			child.geometry = new THREE.CircleGeometry(config.cupRadius, 64);
		}
	});
	
	scene.children.forEach(child => {
		if(child.geometry instanceof THREE.TubeGeometry) {
			const handleThickness = config.cupRadius * 0.3;
			const handleWidth = config.cupRadius * 1.5;
			
			const newCurve = new THREE.CubicBezierCurve3(
				new THREE.Vector3(-config.cupRadius, config.cupHeight * 0.3, 0),
				new THREE.Vector3(-handleWidth, config.cupHeight * 0.4, 0),
				new THREE.Vector3(-handleWidth, config.cupHeight * 0.6, 0),
				new THREE.Vector3(-config.cupRadius, config.cupHeight * 0.7, 0)
			);
			
			child.geometry.dispose();
			child.geometry = new THREE.TubeGeometry(
				newCurve,
				32,
				handleThickness,
				16,
				false
			);
		}
	});
	
	lightCone.remove(...lightCone.children);
	
	const tiltXRad = config.tiltX * Math.PI / 180;
	const tiltYRad = config.tiltY * Math.PI / 180;
	
	const direction = new THREE.Vector3(
		Math.sin(tiltYRad),
		Math.cos(tiltYRad),
		Math.sin(tiltXRad)
	).normalize();
	
	pointLight.position.set(
		config.lightX, 
		config.lightHeight, 
		config.lightY
	);
	
    pointLight.intensity = config.intensity0 * 150;

    let lengthToGround = config.lightHeight;
    let lengthToCup = Infinity;

    const angleRad = config.lightAngle * Math.PI / 180;
    const halfAngle = angleRad / 2;
    const tanHalfAngle = Math.tan(halfAngle);

    const distanceToCupEdge = Math.sqrt(config.cupRadius * config.cupRadius - Math.min(config.lightX * config.lightX + config.lightY * config.lightY,config.cupRadius * config.cupRadius));
    lengthToCup = distanceToCupEdge / tanHalfAngle;

    let length = Math.min(lengthToGround, lengthToCup);

    length = Math.max(length, 0.1);
	
	const coneMaterial = new THREE.ShaderMaterial({
		opacity: 0.1,
		transparent: true,
		side: THREE.DoubleSide,
		uniforms: {
			color1: { value: new THREE.Color(1.0, 1.0, 0.5) },
			color2: { value: new THREE.Color(1.0, 1.0, 0.5) }
		},
		vertexShader: `
			varying float vHeight;
			void main() {
				vHeight = position.y;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: `
			varying float vHeight;
			uniform vec3 color1;
			uniform vec3 color2;
			void main() {
				float alpha = smoothstep(-5.0, 5.0, vHeight) * 0.5;
				gl_FragColor = vec4(mix(color1, color2, 1.0 - alpha), alpha);
			}
		`
	});
	
	const radiusBase = Math.tan(config.lightAngle * Math.PI / 360) * length;
	const coneGeometry = new THREE.ConeGeometry(radiusBase, length, 64, 1, true);
	const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
	
	coneMesh.position.copy(direction.clone().multiplyScalar(-length / 2));
	
	coneMesh.quaternion.setFromUnitVectors(
		new THREE.Vector3(0, 1, 0),
		direction.clone().normalize()
	);
	
	lightCone.position.set(
		config.lightX, 
		config.lightHeight, 
		config.lightY
	);
	
	lightCone.add(coneMesh);
}

window.addEventListener('DOMContentLoaded', () => {
	cupHeightSlider.value = config.cupHeight;
	cupRadiusSlider.value = config.cupRadius;
	lightHeightSlider.value = config.lightHeight;
	lightAngleSlider.value = config.lightAngle;
	tiltXSlider.value = config.tiltX;
	tiltYSlider.value = config.tiltY;
	rayCountSlider.value = config.rayCount / 1000;
	attenuationSlider.value = config.attenuation * 100;
	maxReflectionsSlider.value = config.maxReflections;
	pointRadiusSlider.value = config.radius;
	intensity0Slider.value = config.intensity0;
	reflectionMinSlider.value = config.minReflections;
	reflectionMaxSlider.value = config.maxReflections;
	lightXSlider.value = config.lightX;
	lightYSlider.value = config.lightY;
	
	reflectionMinSlider.max = config.maxReflections;
	reflectionMaxSlider.max = config.maxReflections;

	cupHeightValue.textContent = config.cupHeight.toFixed(1);
	cupRadiusValue.textContent = config.cupRadius.toFixed(1);
	lightHeightValue.textContent = config.lightHeight.toFixed(1);
	lightAngleValue.textContent = `${config.lightAngle}°`;
	tiltXValue.textContent = `${config.tiltX}°`;
	tiltYValue.textContent = `${config.tiltY}°`;
	rayCountValue.textContent = (config.rayCount / 1000).toString();
	attenuationValue.textContent = config.attenuation.toFixed(2);
	maxReflectionsValue.textContent = config.maxReflections.toString();
	pointRadiusValue.textContent = config.radius.toFixed(1);
	intensity0Value.textContent = config.intensity0.toFixed(2);
	reflectionMinValue.textContent = config.minReflections;
	reflectionMaxValue.textContent = config.maxReflections;
	lightXValue.textContent = config.lightX.toFixed(1);
	lightYValue.textContent = config.lightY.toFixed(1);

	window.addEventListener('load', initSliderValuePositions);
	window.addEventListener('resize', initSliderValuePositions);
	
	startSimulation();
	
	initThreeScene();
});
