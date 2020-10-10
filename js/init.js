const axis = {
	right: new THREE.Vector3(-1, 0, 0),
	left: new THREE.Vector3(1, 0, 0),
	up: new THREE.Vector3(0, -1, 0),
	down: new THREE.Vector3(0, 1, 0),
	front: new THREE.Vector3(0, 0, -1),
	back: new THREE.Vector3(0, 0, 1)
};

const white = 0xffffff;
const red = 0xff0000;
const yellow = 0xffff00;
const orange = 0xff8800;
const green = 0x008800;
const blue = 0x0000ff;
const black = 0x000000;
const grey = 0x999999;

const mat = new THREE.MeshBasicMaterial({ vertexColors: true });
const transparentMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });

const urlParams = new URLSearchParams(window.location.search);
const embed = urlParams.has('embed');

const width = urlParams.has('width') ? urlParams.get('width') : 3;
const height = urlParams.has('height') ? urlParams.get('height') : width;
const depth = urlParams.has('depth') ? urlParams.get('depth') : width;
const longest = Math.max(width, height, depth);
const type = urlParams.has('type') ? urlParams.get('type') : 'cube';

const loader = new THREE.TextureLoader();
const materialsColors = {
	'w': new THREE.MeshBasicMaterial({map: loader.load('./textures/w.png')}),
	'r': new THREE.MeshBasicMaterial({map: loader.load('./textures/r.png')}),
	'y': new THREE.MeshBasicMaterial({map: loader.load('./textures/y.png')}),
	'o': new THREE.MeshBasicMaterial({map: loader.load('./textures/o.png')}),
	'g': new THREE.MeshBasicMaterial({map: loader.load('./textures/g.png')}),
	'b': new THREE.MeshBasicMaterial({map: loader.load('./textures/b.png')}),
	'_': new THREE.MeshBasicMaterial({map: loader.load('./textures/_.png')}),
	'-': new THREE.MeshBasicMaterial({map: loader.load('./textures/-.png')})
};

var colors = {
	'U': ['w'],
	'R': ['r'],
	'F': ['g'],
	'L': ['o'],
	'B': ['b'],
	'D': ['y']
};
for (let face of 'URFLBD') {
	let l = width;
	let L = height;
	if('LR'.includes(face)){
		l = depth;
	} else if('UD'.includes(face)){
		L = depth;
	}
	for (let i = 1; i < l * L; i++) {
		colors[face].push(colors[face][0]);
	}
}

const min = { x: -(width-1)/2, y: -(height-1)/2, z: -(depth-1)/2 };
const max = { x: (width-1)/2, y: (height-1)/2, z: (depth-1)/2 };

const speed = 32;

var scene, camera, renderer, controls;

var algorithm = [];
var algorithmIndex = 0;
var algoReverse = -1;

var keys = {};
var acutalIndice = '';
var keysActive = true;

var cubes = [];

var queue = [];
var shots = [];

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.copy(new THREE.Vector3(longest * 2, longest * 2, longest * 2));

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x333333);
	document.body.appendChild(renderer.domElement);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enablePan = false;
	controls.enableZoom = false;

	switch(type) {
		case 'cube':
			generateCubeZones();
			break;
	}

	if(urlParams.has('config')){
		let path = urlParams.get('config').split(':');
		$.ajax({ 
			url: 'algorithms/'+path[0]+'.json', 
			dataType: 'json', 
			async: false, 
			success: function(json){ 
				colors = { 'U': [], 'R': [], 'F': [], 'L': [], 'B': [], 'D': [] };
				let colors2 = json[path[1]].colors;

				for (let face of 'URFLBD') {
					for (let i = 0; i < colors2[face].length; i++) {
						colors[face].push('-');
						colors[face][i] = colors2[face][i];
					}
				}

				updateAlgorithm(json[path[1]].algo);
			} 
		});
	}

	switch(type) {
		case 'cube':
			generateCubeCubies();
			break;
	}
}

function animate() {
	requestAnimationFrame(animate);
	executeQueue();
	controls.update();
	renderer.render(scene, camera);
}