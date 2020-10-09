function press(code, reverse = false) {
	if(code[0] == '#'){
		switch(code[1]){
			case '1':
				shots = [];
				if(Object.values(keys).length > 0){
					for (let i = 0; i < 40; i++) {
						addToQueue(Object.values(keys).sample(), [1, -1, 2].sample(), false);
					}
				}
				break;
			case '2':
				if(shots.length > 0){
					let shot = shots.pop();
					addToQueue(shot[0], -shot[1], false);
				}
				break;
		}
	} else {
		let direction = 1;
		if(code[code.length-1] == '\''){
			direction = -1;
			code = code.slice(0, -1);
		} else if(code[code.length-1] == '2'){
			direction = 2;
			code = code.slice(0, -1);
		}
		if(reverse){
			direction = -direction;
		}
		if(keys[code] !== undefined){
			addToQueue(keys[code], direction);
		}
	}
}

function addToQueue(key, direction, save = true) {
	let action = [];
	for(let zone of key.zones) {
		let group = new THREE.Group();
		scene.add(group);
		action.push({ zone: zone, direction: direction, axis: key.axis, i: 0, group: group });
	}
	if(save){
		shots.push([key, direction]);
	}
	queue.unshift(action);
}

function executeQueue() {
	if(queue.length > 0){
		let action = queue[queue.length-1];
		for(let singleAction of action) {

			let group = singleAction.group;
			group.position.copy(singleAction.zone.center);

			if(group.children.length == 0){

				for(let cube of cubes) {
					for(let authorizedCube of singleAction.zone.cubes) {
						let worldPosition = new THREE.Vector3();
						cube.getWorldPosition(worldPosition);
						if(worldPosition.distanceTo(authorizedCube) < 1e-10){
							group.attach(cube);
						}
					}
				}
			}

			group.rotateOnAxis(singleAction.axis, singleAction.zone.angle / speed * singleAction.direction);

			if(++singleAction.i >= speed){
				queue.pop();
				for (let children of group.children) {
					let worldPosition = new THREE.Vector3();
					children.getWorldPosition(worldPosition);
					let worldRotation = new THREE.Quaternion();
					children.getWorldQuaternion(worldRotation);
					children.parent = null;
					children.position.copy(worldPosition);
					children.quaternion.copy(worldRotation);
				}
			}
		}
	}
}

function updateAlgorithm() {
	let values = (urlParams.has('algo') ? urlParams.get('algo') : document.getElementById('input').value).split(' ');
	algorithm = [];
	for (let i = 0; i < values.length; i++) {
		if(values[i].length >= 1){
			let value = '';
			if('LRUDFBMESXYZ'.includes(values[i][0])){
				value = values[i][0];
				for (let j = 1; j < values[i].length-1; j++) {
					value += toIndice(values[i][j]);
				}
				if(values[i].length >= 2){
					if('\'2'.includes(values[i][values[i].length-1])){
						value += values[i][values[i].length-1];
					}
				}
			}
			algorithm.push(value);
		}
	}
	document.getElementById('algorithm').innerHTML = algorithm.join(' ');
	algorithmIndex = 0;
	algoReverse = true
}

function executeCode(reverse = false) {
	if(reverse && algorithmIndex > 0 || !reverse && algorithmIndex < algorithm.length-1 || algorithm.length == 1){
		if(reverse == algoReverse){
			algorithmIndex += reverse ? -1 : 1;
			algorithmIndex = Math.min(Math.max(algorithmIndex, 0), algorithm.length-1);
		}
		press(algorithm[algorithmIndex], reverse, false);
		let showAlgo = [...algorithm];
		showAlgo[algorithmIndex] = '<span id="current">'+showAlgo[algorithmIndex]+'</span>';
		document.getElementById('algorithm').innerHTML = showAlgo.join(' ');
	}
	algoReverse = reverse;
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

function toIndice(number) {
	number += '';
	for (let i = 0; i <= 9; i++) {
		number = number.replaceAll(i, '₀₁₂₃₄₅₆₇₈₉'[i]);
	}
	if(number == '₁'){
		number = '';
	}
	return number;
}

