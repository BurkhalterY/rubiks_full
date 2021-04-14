var camera, controls, scene, renderer, world;

const urlParams = new URLSearchParams(window.location.search);
const size = 3;

const min = { x: -(size-1)/2, y: -(size-1)/2, z: -(size-1)/2 };
const max = { x: (size-1)/2, y: (size-1)/2, z: (size-1)/2 };

const loader = new THREE.TextureLoader();
const materialsColors = {
	'w': new THREE.MeshBasicMaterial({map: loader.load('./res/w.png')}),
	'r': new THREE.MeshBasicMaterial({map: loader.load('./res/r.png')}),
	'y': new THREE.MeshBasicMaterial({map: loader.load('./res/y.png')}),
	'o': new THREE.MeshBasicMaterial({map: loader.load('./res/o.png')}),
	'g': new THREE.MeshBasicMaterial({map: loader.load('./res/g.png')}),
	'b': new THREE.MeshBasicMaterial({map: loader.load('./res/b.png')}),
	'_': new THREE.MeshBasicMaterial({map: loader.load('./res/_.png')}),
	'-': new THREE.MeshBasicMaterial({map: loader.load('./res/-.png')})
};

var colorMap = {
	'U': 'w'.repeat(size*size),
	'R': 'o'.repeat(size*size),
	'F': 'b'.repeat(size*size),
	'L': 'r'.repeat(size*size),
	'B': 'g'.repeat(size*size),
	'D': 'y'.repeat(size*size),
};

var cubes = [];
var rotationZones = [];
var queue = [];
var keys = [];
var algorithm = [];
var algoIndex = 0;
var algoReverse = -1;

init();
loop();

function init() {

	let canvas = document.getElementById("canvas");

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
	let camPos = new THREE.Vector3(.5, .25, .25);
	camPos.normalize();
	camPos.multiplyScalar(size*3);
	camera.position.copy(camPos);

	controls = new THREE.OrbitControls(camera, canvas);
	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({ canvas: canvas });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x333333);

	window.addEventListener('resize', onWindowResize, false);

	if(urlParams.has('config')){
		let path = urlParams.get('config').split(':');
		$.ajax({ 
			url: 'algorithms/'+path[0]+'.json',
			dataType: 'json',
			async: false,
			success: function(json){
				colorMap = json[path[1]].colors;
				executeAlgorithm(json[path[1]].algo);
			} 
		});
	}

	let chars = "BSFDEURML".split('');
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
						let arr = getColor(face, x, y, z);
						if(arr[0] == '_'){
							materials.push(materialsColors['_']);
						} else {
							materials.push(materialsColors[colorMap[arr[0]][arr[1]]]);
						}
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

function getColor(face, x, y, z) {
	if(face == 0 && x == max.x){
		return ['F', colorMap.F.length-1-((y+max.y)*size+(z+max.z))];
	}
	else if(face == 1 && x == min.x){
		return ['B', colorMap.B.length-1-((y+max.y+1)*size-1-(z+max.z))];
	}
	else if(face == 2 && y == max.y){
		return ['U', (x+max.x+1)*size-1-(z+max.z)];
	}
	else if(face == 3 && y == min.y){
		return ['D', colorMap.D.length-1-((x+max.x)*size+(z+max.z))];
	}
	else if(face == 4 && z == max.z){
		return ['L', colorMap.L.length-1-((y+max.y+1)*size-1-(x+max.x))];
	}
	else if(face == 5 && z == min.z){
		return ['R', colorMap.R.length-1-((y+max.y)*size+(x+max.x))];
	}
	else {
		return ['_', 0];
	}
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

function executeAlgorithm(strAlgo) {
	let algo = strAlgo.split(' ');
	for (let action of algo) {
		if(action[0] != '(' && action[0] != ')'){

			let direction = 1;
		
			if (action.length > 1 && action[action.length-1] == "'") {
				direction *= -1;
				action = action.slice(0, -1);
			}
			if (action.length > 1 && action[action.length-1] == "2") {
				direction *= 2;
				action = action.slice(0, -1);
			}

			algorithm.push([action[0], direction]);
		}
	}
	algoIndex = 0;
	algoReverse = -1;
}

function executeCode(reverse = 1) {
	if(reverse == algoReverse){
		algoIndex += reverse;
	}
	algoReverse = reverse;
	if(algoIndex < 0 || algoIndex >= algorithm.length){
		algoIndex = Math.min(Math.max(algoIndex, 0), algorithm.length-1);
	} else {
		addToQueue(algorithm[algoIndex][0], algorithm[algoIndex][1] * reverse);
	}
}

function executeAlgorithmFromInput() {
	executeAlgorithm($('#algorithm').val());
}

function first() {
	for (let i = 0; i < algorithm.length; i++) {
		executeCode(-1);
	}
}

function prec() {
	executeCode(-1);
}

function next() {
	executeCode();
}

function last() {
	for (let i = 0; i < algorithm.length; i++) {
		executeCode();
	}
}

document.getElementById('btn-ok').addEventListener('click', executeAlgorithmFromInput);
document.getElementById('btn-first').addEventListener('click', first);
document.getElementById('btn-prec').addEventListener('click', prec);
document.getElementById('btn-next').addEventListener('click', next);
document.getElementById('btn-last').addEventListener('click', last);