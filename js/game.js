var states = {
	playing: 0,
	start: 1,
	end: 2
};

var game = {
	speed: 20,
	difficulty: 1,
	seaRadius: 600,
	time: new Date().getTime(),
	score: 0,
	goodRings: 0,
	state: states.playing
};

var worldElem = document.getElementById('world');
var ringsNumberElem = document.getElementById('ringsNumber');
var distanceElem = document.getElementById('distance');
var redcolor = 140, greencolor = 160, bluecolor = 220;

var Colors = {
	red: 0xf25346,
	white: 0xf8d0d1,
	brown: 0x59332e,
	pink: 0xF5986E,
	brownDark: 0x23190f,
	blue: 0x68c3c0,
};

window.addEventListener('load', init, false);
function init() {
	createScene();
	createLights();
	createPlane();
	createSea();
	createSky();
	createRings();
	createBullets();
	createStars();
	document.addEventListener('mousemove', handleMouseMove, false);
	document.addEventListener('mousedown', handleMouseDown, false);
	loop();
}
var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container;
function createScene() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0xc4f9aa, 50, 950);
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
	);
	camera.position.x = 0;
	camera.position.y = 100;
	camera.position.z = 200;
	renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true
	});
	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMap.enabled = true;
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);
	window.addEventListener('resize', handleWindowResize, false);
}
function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}
var hemisphereLight, shadowLight;
function createLights() {
	hemisphereLight = new THREE.HemisphereLight(0xa1a2a3,0x000000, .9);
	shadowLight = new THREE.DirectionalLight(0xffffff, .8);
	ambientLight = new THREE.AmbientLight(0xdc8874, .5);
	shadowLight.position.set(150, 350, 350);
	shadowLight.castShadow = true;
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	scene.add(hemisphereLight);
	scene.add(shadowLight);
	scene.add(ambientLight);
}
var cylinderRadius = 600;
var mousePos = {
	x: 0,
	y: 0
};
Sea = function() {
	var geom = new THREE.CylinderGeometry(cylinderRadius, 600, 800, 60, 30);
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
	geom.mergeVertices();
	this.waves = [];
	var sz = geom.vertices.length;
	for (var i = 0; i < sz; i++) {
		var v = geom.vertices[i];
		this.waves.push({
			x: v.x,
			y: v.y,
			z: v.z,
			angle: Math.random() * Math.PI * 2,
			dist: 5 + Math.random() * 15,
			speed: game.speed * 0.0008 + Math.random() * 0.03
		});
	}
	var mat = new THREE.MeshPhongMaterial({
		color: Colors.blue,
		transparent: true,
		opacity: .6,
		shading: THREE.FlatShading
	});
	this.mesh = new THREE.Mesh(geom, mat);
	this.mesh.receiveShadow = true;
}
Sea.prototype.moveWaves = function() {
	var vertices = this.mesh.geometry.vertices;
	var sz = vertices.length;
	for (var i = 0; i < sz; i++) {
		var v = vertices[i];
		var vp = this.waves[i];
		v.x = vp.x + Math.cos(vp.angle) * vp.dist;
		v.y = vp.y + Math.sin(vp.angle) * vp.dist;
		vp.angle += vp.speed;
	}
	this.mesh.geometry.verticesNeedUpdate = true;
	sea.mesh.rotation.z += game.speed * 0.00025;
}
var sea;
function createSea() {
	sea = new Sea();
	sea.mesh.position.y = -600;
	scene.add(sea.mesh);
}
Cloud = function() {
	this.mesh = new THREE.Object3D();
	var geom = new THREE.TetrahedronGeometry(50,2);
	var mat = new THREE.MeshBasicMaterial( {color: 0x808080 } );
	var nBlocs = 3 + Math.floor(Math.random() * 3);
	for (var i = 0; i < nBlocs; i++) {
		var m = new THREE.Mesh(geom, mat);
		m.position.x = i * 10;
		m.position.y = Math.random() * 10;
		m.position.z = Math.random() * 10;
		m.rotation.z = Math.random() * Math.PI * 2;
		m.rotation.y = Math.random() * Math.PI * 2;
		var s = 0.6 * Math.random() * 0.9;
		m.scale.set(s, s, s);
		m.castShadow = true;
		m.receiveShadow = true;
		this.mesh.add(m);
	}
}
Sky = function() {
	this.mesh = new THREE.Object3D();
	this.nClouds = 20;
	var stepAngle = Math.PI * 2 / this.nClouds;
	for (var i = 0; i < this.nClouds; i++) {
		var c = new Cloud();
		var angle = stepAngle * i;
		var h = Math.random() * 200 + 750;
		c.mesh.position.y = Math.sin(angle) * h;
		c.mesh.position.x = Math.cos(angle) * h;
		c.mesh.rotation.z = angle + Math.PI / 2;
		c.mesh.position.z = -400 - Math.random() * 400;
		var s = Math.random() * 10 + 1;
		c.mesh.scale.set(s, s, s);
		this.mesh.add(c.mesh);
	}
}
var sky;
function createSky() {
	sky = new Sky();
	sky.mesh.position.y = -600;
	scene.add(sky.mesh);
}
Ring = function(r) {
	// console.log('RADI:' + r);
	var geom = new THREE.TorusGeometry(r, 1, 16, 100);
	geom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI / 2 - 0.2));
	var mat = new THREE.MeshPhongMaterial({
		color: 0xffff00,
		specular: 0xffffff,
		side: THREE.DoubleSide,
		skining: true,
		shininess: 20,
		shading: THREE.FlatShading
		// emissive: 0xff0fff
	});
	// var mat = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
	this.angle = 0;
	this.dist = 0;
	this.radius = r;
	this.delete = false;
	this.mesh = new THREE.Mesh(geom, mat);
	this.mesh.receiveShadow = true;
}
var ringSet;
RingSet = function(n) {
	this.currentRings = [];
	this.nextRings = [];
	this.mesh = new THREE.Object3D();
	for (var i = 0; i < n; i++) {
		var r = Math.random() * 20 + 20;
		var ring = new Ring(r);
		// var s = Math.random() * 2;
		// s = Math.max(s, 1.2);
		// ring.mesh.scale.set(r, r, r);
		this.nextRings.push(ring);
	}
}
RingSet.prototype.spawnRings = function() {
	var n = Math.floor(Math.random()) * 10 + 1;
	var radius = cylinderRadius * Math.max(Math.random() - 0.6, Math.random() * 0.2 + 0.1);
	for (var i = 0; i < n; i++) {
		var ring;
		if (!this.nextRings.length) {
			for (var j = 0; j < 20; j++) this.nextRings.push(new Ring(Math.random() * 20 + 20));
		}
		ring = this.nextRings.pop();
		this.mesh.add(ring.mesh);
		this.currentRings.push(ring);
		ring.angle = -(i * 0.06);
		ring.dist = radius;
		ring.mesh.position.x = Math.cos(ring.angle) * ring.dist;
		ring.mesh.position.y = Math.sin(ring.angle) * ring.dist;
		// ring.mesh.rotation.z = Math.random() * Math.PI;
		ring.mesh.rotation.z = -Math.PI / 2;
	}
}
function updateRingScore(n) {
	game.goodRings += n;
	ringsNumberElem.innerHTML = game.goodRings;
}

RingSet.prototype.update = function() {
	var n = this.currentRings.length;
	for (var i = 0; i < n; i++) {
		var ring = this.currentRings[i];
		if (!ring) continue;
		ring.angle += Math.random() * game.speed * 0.002;
		ring.mesh.position.x = Math.cos(ring.angle) * ring.dist;
		ring.mesh.position.y = Math.sin(ring.angle) * ring.dist;
		// ring.mesh.rotation.x += 0.02;
		ring.mesh.rotation.z += ring.angle * game.speed * 0.0007;
		// check if the plane has passed to a ring
		var targetX = normalize(mousePos.x, -1, 1, -100, 100);
		var targetY = normalize(mousePos.y, -1, 1, 25, 175);
		// console.log('player y: ' + targetY);
		if (targetY >= ring.mesh.position.y - ring.radius && targetY <= ring.mesh.position.y + ring.radius) {
			if (ring.mesh.position.x >= -5 && ring.mesh.position.x <= 5) {
				ring.delete = true;
			}
		}
		bad = function(ring) {
			ring.mesh.scale.x -= 0.1;
			ring.mesh.scale.y -= 0.1;
			ring.mesh.scale.z -= 0.1;
			if (ring.mesh.scale.x < 0 && ring.mesh.scale.y < 0 && ring.mesh.scale.z < 0) return true;
			return false;
		}
		if (ring.delete && bad(ring)) {
			ring.delete = false;
			// this.nextRings.unshift(this.currentRings.splice(i,1)[0]);
			this.currentRings.splice(i, 1);
			this.mesh.remove(ring.mesh);
			i--;
			updateRingScore(1);
			continue;
		}
		// check if it's out of the screen
		if (ring.angle > Math.PI) {
			this.currentRings.splice(i, 1);
			// this.currentRings.splice(i, 1);
			this.mesh.remove(ring.mesh);
			i--;
		}
	}
}
function createRings() {
	ringSet = new RingSet(15);
	scene.add(ringSet.mesh);
	// ring = new Ring();
	// // ring.mesh.position.x = 0;
	// ring.mesh.position.y = 120;
	// // ring.mesh.scale.set(3, 3, 3);
	// scene.add(ring.mesh);
}
var AirPlane = function() {

this.mesh = new THREE.Object3D();

// Create the cabin
var geomCockpit = new THREE.BoxGeometry(60,50,50,1,1,1);
var matCockpit = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
cockpit.castShadow = true;
cockpit.receiveShadow = true;
this.mesh.add(cockpit);

// Create the engine
var geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
var matEngine = new THREE.MeshPhongMaterial({color:Colors.white, shading:THREE.FlatShading});
var engine = new THREE.Mesh(geomEngine, matEngine);
engine.position.x = 40;
engine.castShadow = true;
engine.receiveShadow = true;
this.mesh.add(engine);

// Create the tail
var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
var matTailPlane = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
tailPlane.position.set(-35,25,0);
tailPlane.castShadow = true;
tailPlane.receiveShadow = true;
this.mesh.add(tailPlane);

// Create the wing
var geomSideWing = new THREE.BoxGeometry(40,8,150,1,1,1);
var matSideWing = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
sideWing.castShadow = true;
sideWing.receiveShadow = true;
this.mesh.add(sideWing);

// propeller
var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
var matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
this.propeller.castShadow = true;
this.propeller.receiveShadow = true;

// blades
var geomBlade = new THREE.BoxGeometry(1,100,20,1,1,1);
var matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});

var blade = new THREE.Mesh(geomBlade, matBlade);
blade.position.set(8,0,0);
blade.castShadow = true;
blade.receiveShadow = true;
this.propeller.add(blade);
this.propeller.position.set(50,0,0);
this.mesh.add(this.propeller);
};
function createPlane() {
	airplane = new AirPlane();
	airplane.mesh.scale.set(0.25, 0.25, 0.25);
	airplane.mesh.position.y = 100;
	scene.add(airplane.mesh);
}
Star = function() {
	var geom = new THREE.OctahedronGeometry(8);
	var mat = new THREE.MeshPhongMaterial({
	    color: 0xf0ea99,
	    shininess: 0,
	    specular: 0xffffff,
		opacity: 0.5,
	    shading: THREE.FlatShading
	});
	this.angle = 0;
	this.dist = 0;
	this.mesh = new THREE.Mesh(geom, mat);
}

StarSet = function() {
	this.mesh = new THREE.Object3D();
	this.currentStars = [];
}

StarSet.prototype.spawnStars = function(n) {
	for (var i = 0; i < n; i++) {
		var star = new Star();
		var angle = Math.random() * Math.PI * 2;
		var h = Math.random() * 200 + 750;
		star.mesh.position.x = Math.cos(angle) * h;
		star.mesh.position.y = Math.sin(angle) * h;
		star.mesh.rotation.z = angle + Math.PI / 2;
		star.dist = Math.random() * 250 + 600;
		star.mesh.position.z = -400 - Math.random() * 400;
		this.currentStars.push(star);
		this.mesh.add(star.mesh);
	}
}

StarSet.prototype.update = function() {
	var n = this.currentStars.length;
	for (var i = 0; i < this.currentStars.length; i++) {
		var star = this.currentStars[i];
		star.angle += 0.005 * game.speed * Math.random() * 0.5;
		star.mesh.position.x = Math.cos(star.angle) * star.dist;
		star.mesh.position.y = Math.sin(star.angle) * star.dist;
		if (star.angle > Math.PI) {
			this.currentStars.splice(i, 1);
			this.mesh.remove(star.mesh);
			i--;
		}
	}
}

var starSet;

function createStars() {
	starSet = new StarSet();
	starSet.mesh.position.y = -500;
	scene.add(starSet.mesh);
}

Bullet = function() {
	var geom = new THREE.TetrahedronGeometry(4);
	var mat = new THREE.MeshPhongMaterial({
	    color: 0xf0ea99,
	    shininess: 0,
	    specular: 0xffffff,
	    shading: THREE.FlatShading
	});
	this.mesh = new THREE.Mesh(geom, mat);
}
BulletSet = function(n) {
	this.mesh = new THREE.Object3D();
	this.currentBullets = [];
	this.nextBullets = [];
	// for (var i = 0; i < n; i++) {
	// 	var bullet = new Bullet();
	// 	bullet.mesh.position.x = i * 20;
	// 	var targetY = normalize(mousePos.y, -1, 1, 25, 175);
	// 	bullet.mesh.rotation.z = (targetY - airplane.mesh.position.y) * 0.0128;
	// 	nextBullets.push(bullet);
	// 	// this.mesh.add(bullet);
	// }
}
BulletSet.prototype.update = function() {
	var n = this.currentBullets.length;
	for (var i = 0; i < n; i++) {
		var bullet = this.currentBullets[i];
		if (!bullet) continue;
		bullet.mesh.position.x += 5.5;
		bullet.mesh.position.y += 5.5 * Math.sin(bullet.mesh.rotation.z);
		bullet.mesh.rotation.x += 0.03;
		if (bullet.mesh.position.x > WIDTH) {
			this.currentBullets.splice(i, 1);
			this.mesh.remove(bullet.mesh);
			i--;
		}
	}
}

BulletSet.prototype.spawnBullets = function(n) {
	console.log('rotation: ' + airplane.mesh.rotation.z);
	for (var i = 0; i < n; i++) {
		var bullet = new Bullet();
		bullet.mesh.position.x = -5 + i * 20;
		var targetY = normalize(mousePos.y, -1, 1, 25, 175);
		bullet.mesh.position.y = airplane.mesh.position.y + (airplane.mesh.rotation.z) * 25;
		bullet.mesh.rotation.z = airplane.mesh.rotation.z;
		// bullet.mesh.rotation.z = Math.PI / 5;
		this.currentBullets.push(bullet);
		this.mesh.add(bullet.mesh);
		console.log('done spawning ' + i);
	}
}

var bulletSet;

function createBullets() {
	bulletSet = new BulletSet(3);
	scene.add(bulletSet.mesh);
}

function handleMouseMove(event) {
	var tx = (event.clientX / WIDTH) * 2 - 1;
	var ty = 1 - (event.clientY / HEIGHT) * 2;
	mousePos = {
		x: tx,
		y: ty
	};
}
function handleMouseDown(event) {
	if ('buttons' in event) {
        if (event.buttons === 1) bulletSet.spawnBullets(3);
	}
}

function normalize(v, vmin, vmax, tmin, tmax) {
	var nv = Math.min(v, vmax);
	nv = Math.max(nv, vmin);
	var dv = vmax - vmin;
	var pc = (nv - vmin) / dv;
	var dt = tmax - tmin;
	return dt * pc + tmin;
}
function updatePlane() {
	var targetX = normalize(mousePos.x, -1, 1, -100, 100);
	var targetY = normalize(mousePos.y, -1, 1, 25, 175);
	// airplane.mesh.position.x = targetX;
	// airplane.mesh.position.y = targetY;
	airplane.mesh.rotation.z = (targetY - airplane.mesh.position.y) * 0.0128;
	airplane.mesh.rotation.x = (airplane.mesh.position.y - targetY) * 0.006;
	airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * 0.1;
	camera.position.z = 150 + targetX / 3;
	airplane.propeller.rotation.x += game.speed * 0.015;
}
var dist = 0;

function updateTime() {
	var curTime = new Date().getTime();
	var oldTime = game.time;
	var deltaTime = curTime - oldTime;
	dist += 0.01 * game.speed * deltaTime;
	dist = Math.round(dist);
	game.time = curTime;
}

function updateDistance() {
	dist++;
	distanceElem.innerHTML = dist;
}

function addRings() {
	if (dist % 100 == 0) {
		ringSet.spawnRings();
	}
}

var gradientTop = 0xf4e0ba;
var gradientBottom = 0xe7d9aa;

var colori = 0;
var sign = -1;

function loop() {
	// airplane.propeller.rotation.x += 0.3;
	// sea.mesh.rotation.z += 0.005;
	sky.mesh.rotation.z += game.speed * 0.0005;
	sea.moveWaves();
	ringSet.update();
	bulletSet.update();
	starSet.update();
	updatePlane();
	updateTime();
	updateDistance();
	addRings();
	// console.log('background color: ' + worldElem.style.backgroundColor);
	colori++;
	if (Math.max(redcolor, Math.max(greencolor, bluecolor)) < 0) {
		sign *= -1;
	}
	if (Math.max(redcolor, Math.max(greencolor, bluecolor)) > 255) {
		sign *= -1;
	}
	if (colori % 5 == 0) {
		redcolor += sign, greencolor += sign, bluecolor += sign;
		if (colori % 20 == 0 && Math.min(redcolor, Math.min(greencolor, bluecolor)) < 50) starSet.spawnStars(3);
		worldElem.style.backgroundColor = "rgb(" + redcolor + ", " + greencolor + ", " + bluecolor + ")";
	}
	gradientTop = 0xffffff;
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}
