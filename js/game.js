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
		document.addEventListener('mousemove', handleMouseMove, false);
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
	Sea = function() {
		var geom = new THREE.CylinderGeometry(600, 600, 800, 60, 30);
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
				speed: 0.016 + Math.random() * 0.03
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
		sea.mesh.rotation.z += 0.005;
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
	var mousePos = {
		x: 0,
		y: 0
	};
	function handleMouseMove(event) {
		var tx = (event.clientX / WIDTH) * 2 - 1;
		var ty = 1 - (event.clientY / HEIGHT) * 2;
		mousePos = {
			x: tx,
			y: ty
		};
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
		airplane.propeller.rotation.x += 0.3;
	}
	function loop() {
		// airplane.propeller.rotation.x += 0.3;
		// sea.mesh.rotation.z += 0.005;
		sky.mesh.rotation.z += 0.01;
		sea.moveWaves();
		updatePlane();
		renderer.render(scene, camera);
		requestAnimationFrame(loop);
	}
