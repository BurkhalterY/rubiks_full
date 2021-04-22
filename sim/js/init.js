const axis = {
	right: new THREE.Vector3(-1, 0, 0),
	left: new THREE.Vector3(1, 0, 0),
	up: new THREE.Vector3(0, -1, 0),
	down: new THREE.Vector3(0, 1, 0),
	front: new THREE.Vector3(0, 0, -1),
	back: new THREE.Vector3(0, 0, 1)
};

const urlParams = new URLSearchParams(window.location.search);
const debug = urlParams.has('debug');
const embed = urlParams.has('embed');
const edit = urlParams.has('edit');

const width = urlParams.has('width') ? urlParams.get('width') : 3;
const height = urlParams.has('height') ? urlParams.get('height') : width;
const depth = urlParams.has('depth') ? urlParams.get('depth') : width;
const longest = Math.max(width, height, depth);
const shortest = Math.min(width, height, depth);
const type = urlParams.has('type') ? urlParams.get('type') : 'cube';

const loader = new THREE.TextureLoader();
const materialsColors = {
	'w': new THREE.MeshBasicMaterial({map: loader.load('./res/w.png'), transparent: debug, opacity: .25 }),
	'r': new THREE.MeshBasicMaterial({map: loader.load('./res/r.png'), transparent: debug, opacity: .25 }),
	'y': new THREE.MeshBasicMaterial({map: loader.load('./res/y.png'), transparent: debug, opacity: .25 }),
	'o': new THREE.MeshBasicMaterial({map: loader.load('./res/o.png'), transparent: debug, opacity: .25 }),
	'g': new THREE.MeshBasicMaterial({map: loader.load('./res/g.png'), transparent: debug, opacity: .25 }),
	'b': new THREE.MeshBasicMaterial({map: loader.load('./res/b.png'), transparent: debug, opacity: .25 }),
	'_': new THREE.MeshBasicMaterial({map: loader.load('./res/_.png'), transparent: debug, opacity: .25 }),
	'-': new THREE.MeshBasicMaterial({map: loader.load('./res/-.png'), transparent: debug, opacity: .25 })
};

var colors = {
	'U': 'w'.repeat(width*depth),
	'R': 'o'.repeat(height*depth),
	'F': 'b'.repeat(width*height),
	'L': 'r'.repeat(height*depth),
	'B': 'g'.repeat(width*height),
	'D': 'y'.repeat(width*depth)
};

const min = { x: -(width-1)/2, y: -(height-1)/2, z: -(depth-1)/2, srt: -(shortest-1)/2, lng: -(longest-1)/2 };
const max = { x: (width-1)/2, y: (height-1)/2, z: (depth-1)/2, srt: (shortest-1)/2, lng: (longest-1)/2 };

var speed = urlParams.has('speed') ? urlParams.get('speed') : document.getElementById("speed").value;

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
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	let camPos = new THREE.Vector3(0.5, 0.5, 1);
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
		case 'pyraminx':
			generatePyraminxZones();
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
		case 'pyraminx':
			generatePyraminxCubies();
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