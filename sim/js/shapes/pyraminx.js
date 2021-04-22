function generatePyraminxZones() {
	const axesHelper = new THREE.AxesHelper( 1 );
	scene.add( axesHelper );

	let w = 1;
	let h = Math.sqrt(2/3);
	let d = Math.sqrt(.75);
	let r1 = Math.sqrt(6)/4;
	let r2 = Math.sqrt(2)/2;
	let pd = Math.sqrt(3)/6;

	console.log(h,d,r1,r2,pd);

	for (let y = max.srt; y >= min.srt; y--) {
		let zone = {
			zone: new THREE.Mesh(new THREE.PlaneGeometry(shortest * 3, shortest * 3), new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })),
			center: new THREE.Vector3(0, 0, max.srt * (d - pd)),
			angle: Math.PI/1.5
		};
		scene.add(zone.zone);
		zone.zone.position.y = y * h;
		zone.zone.rotation.x = Math.PI / 2;

		let key = toNotation(y, 'U');
		keys[key] = { zones: [zone], axis: axis.up };
	}
}

function generatePyraminxCubies() {
	let w = 1;
	let h = Math.sqrt(2/3);
	let d = Math.sqrt(.75);
	let r1 = Math.sqrt(6)/4;
	let r2 = Math.sqrt(2)/2;
	let pd = Math.sqrt(3)/6;

	let i = 0;
	for (let y = max.srt; y >= min.srt; y--) {
		for (let x = max.srt; x >= y; x--) {
			for (let z = max.srt; z >= x; z--) {
				let box = new THREE.TetrahedronGeometry(r1);
				box.applyMatrix4(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, -1).normalize(), Math.atan(Math.sqrt(2))));
				box.applyMatrix4(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0).normalize(), 3*Math.PI/4));

				let cube = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, transparent: false, opacity: .25, wireframe: false }));

				cube.position.x = (x - (y+z) / 2) * w;
				cube.position.y = y * h;
				cube.position.z = z * d - y * pd;

				scene.add(cube);
				cubes[i++] = cube;
			}
		}
	}
	for (let y = max.srt; y >= min.srt + 1; y--) {
		for (let x = max.srt; x >= y; x--) {
			for (let z = max.srt; z >= x; z--) {
				let box = new THREE.OctahedronGeometry(r2);
				box.applyMatrix4(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, -1).normalize(), Math.atan(Math.sqrt(2))));
				box.applyMatrix4(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0).normalize(), 3*Math.PI/4));

				let cube = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, transparent: false, opacity: .25, wireframe: false }));

				cube.position.x = (x - (y+z) / 2) * w;
				cube.position.y = y * h - r1;
				cube.position.z = z * d - y * pd;

				scene.add(cube);
				cubes[i++] = cube;
			}
		}
	}
}

function toNotation(coord, char) {
	coord = max.srt - coord;
	if(coord == 0){
		return char.toLowerCase();
	} else if(coord == 1) {
		return char
	} else if(coord == 2) {
		return char+'w';
	} else {
		return char+'w'+coord;
	}
}

function getColorIndex(face, x, y, z) {
	let a = x + max.x
	let b = y + max.y;
	let l = width;
	let L = height;
	let i = '';
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
		return -1;
	}
	
	if(r == 1){
		a = l - a - 1;
	} else if(r == -1){
		b = L - b - 1;
	}

	return [i, a, b, l, L];
}

function getColor(face, x, y, z) {
	colorIndex = getColorIndex(face, x, y, z);

	let color = '_';
	if(colorIndex != -1){
		color = colors[colorIndex[0]][colorIndex[1] + (colorIndex[4] - colorIndex[2] - 1) * colorIndex[3]];
	}
	if(urlParams.has('stickers')){
		let material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./res/'+urlParams.get('stickers')+'/'+color+'.png') });
		material.map.repeat.set(1/colorIndex[3], 1/colorIndex[4]);
		material.map.offset.set(colorIndex[1]/colorIndex[3], colorIndex[2]/colorIndex[4]);
		return material;
	} else {
		return materialsColors[color];
	}
}
