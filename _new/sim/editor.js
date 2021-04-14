var selectedColor = 'w';

if(urlParams.has('edit')){
	initEdit();
}

String.prototype.replaceAt = function(index, replacement) {
	return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function initEdit() {

	$('#controls').hide();
	$('#editor').show();

	updateJSON();

	document.body.onclick = function (e) {
		e.preventDefault();

		let mouse = new THREE.Vector2();
		mouse.x = (e.clientX / canvas.clientWidth) * 2 - 1;
		mouse.y = -(e.clientY / canvas.clientHeight) * 2 + 1;

		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, camera);
		let intersects = raycaster.intersectObjects(cubes); 

		if(intersects.length > 0) {
			let cube = intersects[0].object;
			cube.material[Math.floor(intersects[0].faceIndex/2)] = materialsColors[selectedColor];

			let colorIndex = getColor(Math.floor(intersects[0].faceIndex/2), cube.position.x, cube.position.y, cube.position.z);
			colorMap[colorIndex[0]] = colorMap[colorIndex[0]].replaceAt(colorIndex[1], selectedColor);
			updateJSON();
		}
	}
}

function selectColor(c) {
	$('#color-'+selectedColor).removeClass('selected');;
	$('#color-'+c).addClass('selected');;
	selectedColor = c;
}

function updateJSON() {
	let json = { map: colorMap, algo: "" };
	$('#output').val(JSON.stringify(json, null, '\t'));
}