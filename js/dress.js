var scene, camera, renderer, controls;
var clothGeometry;
var boundingBox;
var cube;

init();
animate();

function init() {

  // scene

  scene = new THREE.Scene();

  // renderer

  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;

  renderer = new THREE.WebGLRenderer({ antialias: true});
  renderer.setSize(WIDTH, HEIGHT);
  document.body.appendChild(renderer.domElement);

  // camera
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
  camera.position.set(-100, 150, 400);
  scene.add(camera);

  // resizing
  window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = (WIDTH / HEIGHT);
    camera.updateProjectionMatrix();
  });
  renderer.setClearColor(0x333F47, 1);

  var light = new THREE.PointLight(0xffffff);
  light.position.set(50, 100, 50);
  camera.add(light);

  // controls that allow us to change the camera view
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // every object has a geometry and material

  //cube geometry, material, and mesh (to materialize the object)
  var cubeGeometry = new THREE.BoxGeometry(250, 100, 250);
  var cubeMaterial = new THREE.MeshLambertMaterial( {color: 0x43b1b1})
  cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
  cube.position.set(0, 0, 0);

  cubeGeometry.computeBoundingBox();
  boundingBox = cube.geometry.boundingBox.clone(); // for cloth to interact with
  initializeBounds(boundingBox);

  // cloth material
  var loader = new THREE.TextureLoader();
  var clothTexture = loader.load('./assets/textures/fabric_directional.jpg');
  clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
  clothTexture.anisotropy = 16;

  clothMaterial = new THREE.MeshPhongMaterial( {
		color: 0xaa2929,
		specular: 0x030303,
		map: clothTexture,
		side: THREE.DoubleSide,
		alphaTest: 0.5
	} );

  // cloth geometry
  clothGeometry = new THREE.ParametricGeometry(clothInitialPosition, cloth.w, cloth.h);
  clothGeometry.dynamic = true;

  var uniforms = { texture: { value: clothTexture} };
  var vertexShader = document.getElementById('vertexShaderDepth').textContent;
  var fragmentShader = document.getElementById('fragmentShaderDepth').textContent;

  // cloth mesh

  clothObject = new THREE.Mesh(clothGeometry, clothMaterial);
  clothObject.position.set(0, 50, 0);
  clothObject.castShadow = true;

  clothObject.customDepthMaterial = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide
  });

  scene.add(clothObject);

  // floor material
  floorMaterial = new THREE.MeshPhongMaterial({
    color: 0x404761,
		specular: 0x404761
  });

  // floor mesh and floor geometry
  var floorMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(10000, 10000), floorMaterial);
  floorMesh.position.y = -100;
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh); // add floor to scene

  // controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);
  var time = Date.now();
  simulate(time);
  render();
  controls.update();
}

function render() {
  var timer = Date.now() * 0.0002;
  var p = cloth.particles;
  for (var i=0, il = p.length; i<il; i++) {
    clothGeometry.vertices[i].copy(p[i].position);
  }

  // recalculate cloth normals
  clothGeometry.computeFaceNormals();
  clothGeometry.computeVertexNormals();

  clothGeometry.normalsNeedUpdate = true;
  clothGeometry.verticesNeedUpdate = true;

  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}
