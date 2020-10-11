var selectedColor = 'w';

function initEdit() {

	document.getElementById('colors').innerHTML = JSON.stringify(colors, null, '\t');

	document.body.onclick = function (e) {
		e.preventDefault();

		let mouse = new THREE.Vector2();
		mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
		mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;

		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, camera);
		let intersects = raycaster.intersectObjects(cubes); 

		if(intersects.length > 0) {
			let cube = intersects[0].object;
			cube.material[Math.floor(intersects[0].faceIndex/2)] = materialsColors[selectedColor];

			let colorIndex = getColorIndex(Math.floor(intersects[0].faceIndex/2), cube.position.x, cube.position.y, cube.position.z);
			colors[colorIndex[0]] = colors[colorIndex[0]].replaceAt(colorIndex[1] + (colorIndex[4] - colorIndex[2] - 1) * colorIndex[3], selectedColor);
			document.getElementById('colors').innerHTML = JSON.stringify(colors, null, '\t');
		}
	}
}

function changeColor(c) {
	document.getElementById('color-'+selectedColor).classList.remove('selected');;
	document.getElementById('color-'+c).classList.add('selected');;
	selectedColor = c;
}