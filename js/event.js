function first() {
	for (let i = algorithmIndex; i >= 0; i--) {
		executeCode(true);
	}
}

function prec() {
	executeCode(true);
}

function next() {
	executeCode();
}

function last() {
	for (let i = algorithmIndex; i < algorithm.length; i++) {
		executeCode();
	}
}

Array.prototype.sample = function(){
	return this[Math.floor(Math.random() * this.length)];
}

document.getElementById('btn-ok').addEventListener('click', updateAlgorithm);
document.getElementById('btn-first').addEventListener('click', first);
document.getElementById('btn-prec').addEventListener('click', prec);
document.getElementById('btn-next').addEventListener('click', next);
document.getElementById('btn-last').addEventListener('click', last);

if(embed){
	document.getElementById('form-hide').style.display = 'none';
} else {

	document.getElementById('form').onkeydown = function (e) {
		keysActive = false;
	}

	document.getElementById('input').onblur = function (e) {
		keysActive = true;
	}

	document.body.onkeydown = function (e) {
		if(keysActive){
			let key = e.key.toUpperCase();
			if('LRUDFBMESXYZ'.includes(key)) {
				press(key + acutalIndice, (e.ctrlKey ? 2 : 1) * (e.shiftKey ? -1 : 1));
			} else if('123456789'.includes(key)) {
				acutalIndice = toIndice(key);
			} else if(key == ' ') {
				press('#', 1);
			} else if(key == 'BACKSPACE') {
				press('#', 2);
			}
			return false;
		}
	};
}

window.onresize = function () {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	controls.handleResize();
};