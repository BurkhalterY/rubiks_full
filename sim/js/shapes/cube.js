function generateCubeZones() {
	
	keys.X = { zones: [], axis: axis.right };
	keys.Y = { zones: [], axis: axis.up };
	keys.Z = { zones: [], axis: axis.front };

	for (let x = min.x; x <= max.x; x++) {
		let zone = {
			zone: new THREE.Mesh(new THREE.PlaneGeometry(depth - 1, height - 1), new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })),
			center: new THREE.Vector3(),
			angle: Math.PI/2*(depth == height ? 1 : 2)
		};
		scene.add(zone.zone);
		zone.zone.position.x = x;
		zone.zone.rotation.y = Math.PI / 2;

		let key = toNotation(x, min.x, max.x, 'R', 'L', 'M');
		keys[key] = { zones: [zone], axis: key.startsWith('R') ? axis.right : axis.left };
		keys.X.zones.push(zone);

		for (let i = x; i >= 0; i--) {
			let i2 = -min.x-i+1;
			if(i2 != 1){
				if(i2 == 2){
					i2 = '';

					if(!keys.hasOwnProperty('r')){
						keys['r'] = { zones: [], axis: axis.right };
					}

					keys['r'].zones.push(zone);
				}
				if(!keys.hasOwnProperty(i2+'Rw')){
					keys[i2+'Rw'] = { zones: [], axis: axis.right };
				}

				keys[i2+'Rw'].zones.push(zone);
			}
		}
		for (let i = x; i <= 0; i++) {
			let i2 = max.x+i+1;

			if(i2 != 1){
				if(i2 == 2){
					i2 = '';

					if(!keys.hasOwnProperty('l')){
						keys['l'] = { zones: [], axis: axis.left };
					}

					keys['l'].zones.push(zone);
				}
				if(!keys.hasOwnProperty(i2+'Lw')){
					keys[i2+'Lw'] = { zones: [], axis: axis.left };
				}

				keys[i2+'Lw'].zones.push(zone);
			}
		}
	}
	
	for (let y = min.y; y <= max.y; y++) {
		let zone = {
			zone: new THREE.Mesh(new THREE.PlaneGeometry(width - 1, depth - 1), new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })),
			center: new THREE.Vector3(),
			angle: Math.PI/2*(width == depth ? 1 : 2)
		};
		scene.add(zone.zone);
		zone.zone.position.y = y;
		zone.zone.rotation.x = Math.PI / 2;

		let key = toNotation(y, min.y, max.y, 'U', 'D', 'E');
		keys[key] = { zones: [zone], axis: key.startsWith('U') ? axis.up : axis.down };
		keys.Y.zones.push(zone);

		for (let i = y; i >= 0; i--) {
			let i2 = -min.y-i+1;
			if(i2 != 1){
				if(i2 == 2){
					i2 = '';

					if(!keys.hasOwnProperty('u')){
						keys['u'] = { zones: [], axis: axis.up };
					}

					keys['u'].zones.push(zone);
				}
				if(!keys.hasOwnProperty(i2+'Uw')){
					keys[i2+'Uw'] = { zones: [], axis: axis.up };
				}

				keys[i2+'Uw'].zones.push(zone);
			}
		}
		for (let i = y; i <= 0; i++) {
			let i2 = max.y+i+1;

			if(i2 != 1){
				if(i2 == 2){
					i2 = '';

					if(!keys.hasOwnProperty('d')){
						keys['d'] = { zones: [], axis: axis.down };
					}

					keys['d'].zones.push(zone);
				}
				if(!keys.hasOwnProperty(i2+'Dw')){
					keys[i2+'Dw'] = { zones: [], axis: axis.down };
				}

				keys[i2+'Dw'].zones.push(zone);
			}
		}
	}

	for (let z = min.z; z <= max.z; z++) {
		let zone = {
			zone: new THREE.Mesh(new THREE.PlaneGeometry(width - 1, height - 1), new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })),
			center: new THREE.Vector3(),
			angle: Math.PI/2*(width == height ? 1 : 2)
		};
		scene.add(zone.zone);
		zone.zone.position.z = z;

		let key = toNotation(z, min.z, max.z, 'F', 'B', 'S');
		keys[key] = { zones: [zone], axis: key.startsWith('B') ? axis.back : axis.front };
		keys.Z.zones.push(zone);

		for (let i = z; i >= 0; i--) {
			let i2 = -min.z-i+1;
			if(i2 != 1){
				if(i2 == 2){
					i2 = '';

					if(!keys.hasOwnProperty('f')){
						keys['f'] = { zones: [], axis: axis.front };
					}

					keys['f'].zones.push(zone);
				}
				if(!keys.hasOwnProperty(i2+'Fw')){
					keys[i2+'Fw'] = { zones: [], axis: axis.front };
				}

				keys[i2+'Fw'].zones.push(zone);
			}
		}
		for (let i = z; i <= 0; i++) {
			let i2 = max.z+i+1;

			if(i2 != 1){
				if(i2 == 2){
					i2 = '';

					if(!keys.hasOwnProperty('b')){
						keys['b'] = { zones: [], axis: axis.back };
					}

					keys['b'].zones.push(zone);
				}
				if(!keys.hasOwnProperty(i2+'Bw')){
					keys[i2+'Bw'] = { zones: [], axis: axis.back };
				}

				keys[i2+'Bw'].zones.push(zone);
			}
		}
	}
}

function generateCubeCubies() {
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

function toNotation(coord, min, max, charR, charL, charM) {
	if(coord > 0){
		return charR + toIndice(-min-coord+1);
	} else if(coord < 0){
		return charL + toIndice(max+coord+1);
	} else {
		return charM;
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
