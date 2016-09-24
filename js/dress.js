var scene, camera, renderer;
var clothGeometry;

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
  camera.position.set(0, 25, 75);
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
  light.position.set(0, 50, 100);
  camera.add(light);

  // female model

  var femaleModel = new THREE.JSONLoader();
  femaleModel.load("assets/models/dress-model.js", function(geometry) {
    var material = new THREE.MeshLambertMaterial( {
      color: 0xaaaaaa,
      // transparent: true,
      opacity: 0.01
    });
    modelMesh = new THREE.Mesh(geometry, material);
    modelMesh.castShadow = true;
    modelMesh.receiveShadow = true;
    scene.add(modelMesh);
  });

  // cloth material

  var loader = new THREE.TextureLoader();
  var clothTexture = loader.load('./assets/textures/fabric_directional.jpg');
  clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
  clothTexture.anisotropy = 16;

  // var clothMaterial = new THREE.MeshLambertMaterial( {
  //   map: clothTexture
  // });
  clothMaterial = new THREE.MeshPhongMaterial( {
		color: 0xaa2929,
		specular: 0x030303,
		wireframeLinewidth: 2,
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
  clothObject.position.set(0, 0, 0);
  clothObject.castShadow = true;

  clothObject.customDepthMaterial = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide
  });

  scene.add(clothObject);

  // floor material
  // floorMaterial = new THREE.MeshPhongMaterial({
  //   // color: 0x404761
  //   color: 0x379c53,
	// 	specular: 0x404761
  // });

  // floor mesh
  // var floorMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(10000, 10000), floorMaterial);
  // floorMesh.position.y = -250;
  // floorMesh.rotation.x = -Math.PI / 2;
  // floorMesh.receiveShadow = true;
  // scene.add(floorMesh); // add floor to scene

  controls = new THREE.OrbitControls(camera, renderer.domElement);
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
