var DAMPING = 0.03;
var DRAG = 1 - DAMPING;
var MASS = 0.1;
var restDistance = 25;
var xSegs = 10;
var ySegs = 10;

// var GRAVITY = 981 * 1.4;
// var gravity = new THREE.Vector3( 0, -GRAVITY, 0 ).multiplyScalar( MASS );
// var TIMESTEP = 18 / 1000;
// var TIMESTEP_SQ = TIMESTEP * TIMESTEP;

// var wind = true;
// var windStrength = 2;
// var windForce = new THREE.Vector3( 0, 0, 0 );

var clothInitialPosition = plane(restDistance * xSegs, restDistance * ySegs);
var cloth = new Cloth(xSegs, ySegs);

function plane(width, height) {
  return function(u, v) {
    var x = (u - 0.5) * width;
    var y = (v + 0.5) * height;
    var z = 0;

    return new THREE.Vector3(x, y, z);
  };
}

function Particle(x, y, z, mass) {
  this.position = clothInitialPosition(x, y); // position
  this.previous = clothInitialPosition(x, y); // previous
  this.original = clothInitialPosition(x, y);
  this.acceleration = new THREE.Vector3( 50, 50, 0 );
  this.mass = mass;
  this.invMass = 1 / mass;
  this.tmp = new THREE.Vector3();
  this.tmp2 = new THREE.Vector3();
}

// force -> acceleration

Particle.prototype.addForce = function(force) {
  this.a.add(this.tmp2.copy(force).multiplyScalar(this.invMass));
};

Particle.prototype.integrate = function(timesq) {
  var newPos = this.tmp.subVectors(this.position, this.previous);
  newPos.multuplyScalar(DRAG).add(this.position);
  newPos.add(this.acceleration.multuplyScalar(timesq));

  this.tmp = this.previous;
  this.previous = this.position;
  this.position = newPos;

  this.acceleration.set(50, 50, 0);
};

var diff = new THREE.Vector3();

function satisfyConstraints(p1, p2, distance) {
  diff.subVectors(p2.position, p1.position);
  var currentDist = diff.length();
  if (currentDist === 0) return; // prevents division by 0
  var correction = diff.multiplyScalar(1 - distance/currentDist);
  var correctionHalf = correction.multiplyScalar(0.5);
  p1.position.add(correctionHalf);
  p2.position.sub(correctionHalf);
}

// performs Verlet integration

function Cloth(w, h) {
  w = w || 400;
  h = h || 600;
  this.w = w;
  this.h = h;

  var particles = [];
  var constraints = [];

  var u, v;

  // create partucles
  for (v = 0; v <= h; v++  {
    for (u = 0; u <= w; u++) {
      particles.push(new Particle( u / w, v / h, 0, MASS ));
    }
  }

  // structural

  for (v = 0; v < h; v++) {
    for (u = 0; u < w; u++) {
      constraints.push([
        particles[index(u, v)],
        particles[index(u, v + 1)],
        restDistance
      ]);

      constraints.push([
        particles[index(u, v)],
        particles[index(u + 1, v)],
        restDistance
      ]);
    }
  }
  for (u = w, v = 0; v < h; v++) {
    constraints.push([
      particles[index(u,v)],
      particles[index(u, v + 1)],
      restDistance
    ]);
  }

  for (v = h, u = 0; u < w; u++) {
    constraints.push([
      particles[index(u, v)],
      particles[index(u + 1, v)],
      restDistance
    ]);
  }
}
