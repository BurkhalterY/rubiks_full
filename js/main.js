function press(code, direction, reverse = 1) {
	if(code == '#'){
		switch(direction){
			case 1:
				shots = [];
				if(Object.values(keys).length > 0){
					for (let i = 0; i < 40; i++) {
						addToQueue(Object.values(keys).sample(), [1, -1, 2].sample(), false);
					}
				}
				break;
			case 2:
				if(shots.length > 0){
					let shot = shots.pop();
					addToQueue(shot[0], -shot[1], false);
				}
				break;
		}
	} else {
		if(keys[code] !== undefined){
			addToQueue(keys[code], direction * reverse);
		}
	}
}

function addToQueue(key, direction, save = true, algoIndex = null) {
	let action = [];
	for(let zone of key.zones) {
		let group = new THREE.Group();
		scene.add(group);
		action.push({ zone: zone, direction: direction, axis: key.axis, algoIndex: algoIndex, i: 0, group: group });
	}
	if(save){
		shots.push([key, direction]);
	}
	queue.unshift(action);
}

function executeQueue() {
	if(queue.length > 0){
		let finish = false;
		let action = queue[queue.length-1];
		for(let singleAction of action) {

			let group = singleAction.group;
			group.position.copy(singleAction.zone.center);

			if(group.children.length == 0){

				if(singleAction.algoIndex !== null){
					document.getElementById('algorithm').innerHTML = algorithm.map((e, i) => i == singleAction.algoIndex ? '<span id="current">'+e[2]+'</span>' : e[2]).join(' ');
				}

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
				for (let children of group.children) {
					let worldPosition = new THREE.Vector3();
					children.getWorldPosition(worldPosition);
					let worldRotation = new THREE.Quaternion();
					children.getWorldQuaternion(worldRotation);
					children.parent = null;
					children.position.copy(worldPosition);
					children.quaternion.copy(worldRotation);
				}
				finish = true;
			}
		}
		
		if(finish){
			queue.pop();
		}
	}
}

function updateAlgorithm(algo = null) {
	let values = (typeof algo === 'string' ? algo : document.getElementById('input').value).split(' ');
	algorithm = [];

	for (let i = 0; i < values.length; i++) {
		if(values[i] == '(' || values[i] == ')'){
			algorithm.push([values[i], 0, values[i]]);
			continue;
		}

		let rotation = 1;
		let shownValue = values[i];
		if(values[i][values[i].length-1] == '\''){
			rotation *= -1;
			values[i] = values[i].slice(0, -1);
		}
		if(values[i][values[i].length-1] == '2'){
			rotation *= 2;
			values[i] = values[i].slice(0, -1);
		}
		if(Object.keys(keys).includes(values[i])){
			algorithm.push([values[i], rotation, shownValue]);
		}
	}

	document.getElementById('algorithm').innerHTML = algorithm.map(e => e[2]).join(' ');
	updateJSON();

	algorithmIndex = 0;
	algoReverse = false;
}

function executeCode(reverse = 1) {
	if(reverse == algoReverse){
		algorithmIndex += reverse;
	}
	algoReverse = reverse;
	if(algorithmIndex < 0 || algorithmIndex >= algorithm.length){
		algorithmIndex = Math.min(Math.max(algorithmIndex, 0), algorithm.length-1);
	} else {
		if(algorithm[algorithmIndex][0] == '(' || algorithm[algorithmIndex][0] == ')'){
			executeCode(reverse);
		} else {
			addToQueue(keys[algorithm[algorithmIndex][0]], algorithm[algorithmIndex][1] * reverse, false, algorithmIndex);
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

