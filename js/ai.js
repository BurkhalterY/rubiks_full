function updateColors() {
	for (let cube of cubes) {
		let colorIndex = getColorIndex(Math.floor(intersects[0].faceIndex/2), cube.position.x, cube.position.y, cube.position.z);
		colors[colorIndex[0]] = colors[colorIndex[0]].replaceAt(colorIndex[1] + (colorIndex[4] - colorIndex[2] - 1) * colorIndex[3], selectedColor);
	}
}

function getAlgoFromAI() {

	

	$.post('http://deepcube.igb.uci.edu/solve', { state: '[42,28,20,43,4,10,53,34,15,8,1,45,16,13,7,17,25,0,18,19,29,50,22,48,27,30,38,33,21,2,12,31,41,24,32,47,51,46,26,3,40,5,9,52,44,6,37,36,14,49,39,35,23,11]' }).done(function(data) {
		json = JSON.parse(data);
		console.log(json);
		updateAlgorithm(json.solve_text.join(' '));
	});
}