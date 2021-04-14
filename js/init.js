const axis = {
	right: new THREE.Vector3(-1, 0, 0),
	left: new THREE.Vector3(1, 0, 0),
	up: new THREE.Vector3(0, -1, 0),
	down: new THREE.Vector3(0, 1, 0),
	front: new THREE.Vector3(0, 0, -1),
	back: new THREE.Vector3(0, 0, 1)
};

const mat = new THREE.MeshBasicMaterial({ vertexColors: true });
const transparentMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });

const urlParams = new URLSearchParams(window.location.search);
const embed = urlParams.has('embed');
const edit = urlParams.has('edit');

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
	'U': 'w'.repeat(width*depth),
	'R': 'o'.repeat(height*depth),
	'F': 'b'.repeat(width*height),
	'L': 'r'.repeat(height*depth),
	'B': 'g'.repeat(width*height),
	'D': 'y'.repeat(width*depth)
};

const min = { x: -(width-1)/2, y: -(height-1)/2, z: -(depth-1)/2 };
const max = { x: (width-1)/2, y: (height-1)/2, z: (depth-1)/2 };

const speed = 8;

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
	let canvas = document.getElementById("canvas");
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
	let camPos = new THREE.Vector3(-.1, .1, .25);
	camPos.normalize();
	camPos.multiplyScalar(longest*3);
	camera.position.copy(camPos);

	renderer = new THREE.WebGLRenderer({ canvas: canvas });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x333333);

	controls = new THREE.OrbitControls(camera, canvas);
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
				colors = json[path[1]].colors;
				updateAlgorithm(json[path[1]].algo);
			} 
		});
	}

	switch(type) {
		case 'cube':
			generateCubeCubies();
			break;
	}

	if(edit){
		initEdit();
	}
}

function animate() {
	requestAnimationFrame(animate);
	executeQueue();
	renderer.setSize(window.innerWidth, window.innerHeight);
	controls.update();
	renderer.render(scene, camera);
}