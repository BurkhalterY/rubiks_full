function generateCube() {

	if(urlParams.has('colors')){

		colors = { 'U': [], 'R': [], 'F': [], 'L': [], 'B': [], 'D': [] };
		let colors2 = JSON.parse(urlParams.get('colors'));

		for (let face of 'URFLBD') {
			if(colors2.hasOwnProperty(face)){
				for (let i = 0; i < colors2[face].length; i++) {
					colors[face].push('-');
					colors[face][i] = colors2[face][i];
				}
			}
		}
	} else {
		colors = {
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
	}

	keys.X = { zones: [], axis: axis.right };
	keys.Y = { zones: [], axis: axis.up };
	keys.Z = { zones: [], axis: axis.front };

	let maxLongest = (longest-1)/2;

	let xCoords = [];
	let yCoords = [];
	let zCoords = [];

	for (let x = min.x; x <= max.x; x++) {
		let zone = { cubes: [], center: new THREE.Vector3(), angle: Math.PI/2 };

		let key = toNotation(x, min.x, max.x, 'R', 'L', 'M');
		xCoords.push([x, zone]);
		keys[key] = { zones: [zone], axis: key.startsWith('R') ? axis.right : axis.left };
		keys.X.zones.push(zone);
	}
	for (let y = min.y; y <= max.y; y++) {
		let zone = { cubes: [], center: new THREE.Vector3(), angle: Math.PI/2 };

		let key = toNotation(y, min.y, max.y, 'U', 'D', 'E');
		yCoords.push([y, zone]);
		keys[key] = { zones: [zone], axis: key.startsWith('U') ? axis.up : axis.down };
		keys.Y.zones.push(zone);
	}
	for (let z = min.z; z <= max.z; z++) {
		let zone = { cubes: [], center: new THREE.Vector3(), angle: Math.PI/2 };

		let key = toNotation(z, min.z, max.z, 'F', 'B', 'S');
		zCoords.push([z, zone]);
		keys[key] = { zones: [zone], axis: key.startsWith('B') ? axis.back : axis.front };
		keys.Z.zones.push(zone);
	}

	for (let x = -maxLongest; x <= maxLongest; x++) {
		for (let y = -maxLongest; y <= maxLongest; y++) {
			for (let z = -maxLongest; z <= maxLongest; z++) {
				for(let j = 0; j < xCoords.length; j++){
					if(xCoords[j][0] == x) {
						xCoords[j][1].cubes.push(new THREE.Vector3(x, y, z));
					}
				}
				for(let j = 0; j < yCoords.length; j++){
					if(yCoords[j][0] == y) {
						yCoords[j][1].cubes.push(new THREE.Vector3(x, y, z));
					}
				}
				for(let j = 0; j < zCoords.length; j++){
					if(zCoords[j][0] == z) {
						zCoords[j][1].cubes.push(new THREE.Vector3(x, y, z));
					}
				}
			}
		}
	}

	let i = 0;
	for (let x = min.x; x <= max.x; x++) {
		for (let y = min.y; y <= max.y; y++) {
			for (let z = min.z; z <= max.z; z++) {
				if(x == min.x || x == max.x || y == min.y || y == max.y || z == min.z || z == max.z){
					let box = new THREE.BoxGeometry();
					let materials = [];
					for (let j = 0; j < 6; j++) {
						materials.push(getColor(j, x, y, z));
					}

					let cube = new THREE.Mesh(box, materials);

					cube.position.copy(new THREE.Vector3(x, y, z));

					scene.add(cube);
					cubes[i++] = cube;
				}
			}
		}
	}
}

function getColor(face, x, y, z) {

	let a = x + max.x
	let b = y + max.y;
	let l = width;
	let L = height;
	let i = '-';
	let r = 0;

	if(face == 0 && x == max.x){
		i = 'R';
		a = z + max.z;
		l = depth;
		r = 1;
	} else if(face == 1 && x == min.x){
		i = 'L';
		a = z + max.z;
		l = depth;
	} else if(face == 2 && y == max.y){
		i = 'U';
		b = z + max.z;
		L = depth;
		r = -1;
	} else if(face == 3 && y == min.y){
		i = 'D';
		b = z + max.z;
		L = depth;
	} else if(face == 4 && z == max.z){
		i = 'F';
	} else if(face == 5 && z == min.z){
		i = 'B';
		r = 1;
	} else {
		return  materialsColors['_'];
	}
	let color = colors[i][a + (L - b - 1) * l];
	if(urlParams.has('stickers')){
		let material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./textures/'+urlParams.get('stickers')+'/'+color+'.png') });
		material.map.repeat.set(1/l, 1/L);
		if(r == 1){
			a = l - a - 1;
		} else if(r == -1){
			b = L - b - 1;
		}
		material.map.offset.set(a/l, b/L);
		return material;
	} else {
		return materialsColors[color];
	}
}
