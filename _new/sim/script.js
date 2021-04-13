var camera, controls, scene, renderer, world;

const white = 0xffffff;
const red = 0xff0000;
const yellow = 0xffff00;
const orange = 0xff8800;
const green = 0x008800;
const blue = 0x0000ff;
const black = 0x000000;
const grey = 0x999999;

var cubes = [];
var rotationZones = [];
var queue = [];
var keys = [];

const size = 3;

init();
loop();

function init() {

	let canvas = document.getElementById("canvas");

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
	let camPos = new THREE.Vector3(0.5, 0.5, 1);
	camPos.normalize();
	camPos.multiplyScalar(size*3);
	camera.position.copy(camPos);

	controls = new THREE.OrbitControls(camera, canvas);
	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({ canvas: canvas });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x333333);

	window.addEventListener('resize', onWindowResize, false);

	const min = { x: -(size-1)/2, y: -(size-1)/2, z: -(size-1)/2 };
	const max = { x: (size-1)/2, y: (size-1)/2, z: (size-1)/2 };

	function getColor(face, x, y, z) {
		if(face == 0 && x == max.x){
			return new THREE.MeshBasicMaterial({ color: white });
		}
		else if(face == 1 && x == min.x){
			return new THREE.MeshBasicMaterial({ color: yellow });
		}
		else if(face == 2 && y == max.y){
			return new THREE.MeshBasicMaterial({ color: red });
		}
		else if(face == 3 && y == min.y){
			return new THREE.MeshBasicMaterial({ color: orange });
		}
		else if(face == 4 && z == max.z){
			return new THREE.MeshBasicMaterial({ color: blue });
		}
		else if(face == 5 && z == min.z){
			return new THREE.MeshBasicMaterial({ color: green });
		}
	}

	let chars = "FSBDEULMR".split('');
	for (let x = min.x; x <= max.x; x++) {
		let geometry = new THREE.PlaneGeometry(size - 1, size - 1);
		let material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide} );
		let plane = new THREE.Mesh(geometry, material);
		plane.position.x = x;
		plane.rotation.y = Math.PI / 2;
		plane.axe = 'x';
		rotationZones.push(plane);
		scene.add(plane);
		keys[chars.shift()] = { zones: [plane] };
	}

	for (let y = min.y; y <= max.y; y++) {
		let geometry = new THREE.PlaneGeometry(size - 1, size - 1);
		let material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide} );
		let plane = new THREE.Mesh(geometry, material);
		plane.position.y = y;
		plane.rotation.x = Math.PI / 2;
		plane.axe = 'y';
		rotationZones.push(plane);
		scene.add(plane);
		keys[chars.shift()] = { zones: [plane] };
	}

	for (let z = min.z; z <= max.z; z++) {
		let geometry = new THREE.PlaneGeometry(size - 1, size - 1);
		let material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide} );
		let plane = new THREE.Mesh(geometry, material);
		plane.position.z = z;
		plane.axe = 'z';
		rotationZones.push(plane);
		scene.add(plane);
		keys[chars.shift()] = { zones: [plane] };
	}

	for (let x = min.x; x <= max.x; x++) {
		for (let y = min.y; y <= max.y; y++) {
			for (let z = min.z; z <= max.z; z++) {
				if(x == min.x || x == max.x || y == min.y || y == max.y || z == min.z || z == max.z) {
					let box = new THREE.BoxGeometry();
					let materials = [];
					for (let face = 0; face < 6; face++) {
						materials.push(getColor(face, x, y, z));
					}

					let cube = new THREE.Mesh(box, materials);
					cube.position.copy(new THREE.Vector3(x, y, z));

					cubes.push(cube);
					scene.add(cube);
				}
			}
		}
	}
}

function loop() {
	executeQueue();
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function addToQueue(key, direction) {
	let action = [];
	for(let zone of keys[key].zones) {
		action.push({ zone: zone, direction: direction });
	}
	queue.unshift(action);
}

function executeQueue() {
	if(queue.length > 0){
		let finish = false;
		let action = queue[queue.length-1];

		for(let singleAction of action) {

			if(singleAction.pivot === undefined){
				singleAction.pivot = new THREE.Group();
				scene.add(singleAction.pivot);

				for (let cube of cubes) {

					firstBB = new THREE.Box3().setFromObject(singleAction.zone);
					secondBB = new THREE.Box3().setFromObject(cube);

					if(collision = firstBB.intersectsBox(secondBB)){

						singleAction.pivot.add(cube);
					}
				}
				singleAction.pivot.add(singleAction.zone);	
				singleAction.i = 0;
			}

			let speed = 10;
			singleAction.pivot.rotation[singleAction.zone.axe] += Math.PI/2/speed * singleAction.direction;

			if(++singleAction.i >= speed){
				for (let children of singleAction.pivot.children) {
					let worldPosition = new THREE.Vector3();
					children.getWorldPosition(worldPosition);
					let worldRotation = new THREE.Quaternion();
					children.getWorldQuaternion(worldRotation);
					children.parent = null;
					children.position.copy(worldPosition);
					children.quaternion.copy(worldRotation);
				}
				//scene.remove(singleAction.pivot);
				finish = true;
			}
		}
		
		if(finish){
			queue.pop();
		}
	}
}