// var guiEnabled = true;

var DAMPING = 0.03;
var DRAG = 1 - DAMPING;
var MASS = 0.1;

var structuralSprings = true;
// var shearSprings = false;
// var bendingSprings = true;

var restDistance;
// var restDistanceB = 2; // for bending
// var restDistanceS = Math.sqrt(2); // for shearing

var friction = 0.9; // 0 = frictionless, 1 = sticky cloth

var xSegs = 30; // how many particles wide is the cloth
var ySegs = 30; // how many particles tall is the cloth
var fabricLength = 200; // size of cloth

var GRAVITY = 9.81 * 140;
var gravity = new THREE.Vector3( 0, -GRAVITY, 0 ).multiplyScalar( MASS );
var TIMESTEP = 18 / 1000;
var TIMESTEP_SQ = TIMESTEP * TIMESTEP;

// var wind = true;
// var windStrength = 2;
// var windForce = new THREE.Vector3( 0, 0, 0 );

var clothInitialPosition = plane(restDistance * xSegs, restDistance * ySegs);
var cloth = new Cloth(xSegs, ySegs, fabricLength);

// var tmpForce = new THREE.Vector3(); // for wind calc

// for movements and constraints
var diff = new THREE.Vector3();
var lastTime;
var whereAmI, whereWasI;

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
  this.acceleration = new THREE.Vector3( 0, 0, 0 );
  this.mass = mass;
  this.invMass = 1 / mass;
  this.tmp = new THREE.Vector3();
  this.tmp2 = new THREE.Vector3();
}

// force -> acceleration

Particle.prototype.addForce = function(force) {
  this.acceleration.add(
    this.tmp2.copy(force).multiplyScalar(this.invMass)
  );
};

Particle.prototype.integrate = function(timesq) {
  var newPos = this.tmp.subVectors(this.position, this.previous);
  newPos.multuplyScalar(DRAG).add(this.position);
  newPos.add(this.acceleration.multuplyScalar(timesq));

  this.tmp = this.previous;
  this.previous = this.position;
  this.position = newPos;

  this.acceleration.set(0, 0, 0);
};

function satisfyConstraints(p1, p2, distance) {
  diff.subVectors(p2.position, p1.position);
  var currentDist = diff.length();
  if (currentDist === 0) return; // prevents division by 0
  var correction = diff.multiplyScalar(1 - distance/currentDist);
  var correctionHalf = correction.multiplyScalar(0.5);
  p1.position.add(correctionHalf);
  p2.position.sub(correctionHalf);
}

function repelParticles( p1, p2, distance) {
  diff.subVectors( p2.position, p1.position );
  var currentDist = diff.length();
  if ( currentDist == 0 ) return; // prevents division by 0
  if (currentDist < distance){
    var correction = diff.multiplyScalar( (currentDist - distance) / currentDist);
    var correctionHalf = correction.multiplyScalar( 0.5 );
    p1.position.add( correctionHalf );
    p2.position.sub( correctionHalf );
  }
}

// performs Verlet integration

function Cloth(w, h, l) {
  // w = w || 400;
  // h = h || 600;
  this.w = w;
  this.h = h;
  restDistance = l/w;
  this.particles = particles;
  this.constraints = constraints;
  this.index = index;

  var particles = [];
  var constraints = [];

  var u, v;

  // create particles: each pixel of the cloth is a particle
  // that has mass and responds to forces

  for (v = 0; v <= h; v++ ) {
    for (u = 0; u <= w; u++) {
      particles.push(new Particle( u/w, v/h, 0, MASS ));

      // if (v<h && (u == 0 || u == w)){
      //     constrains.push( [
      //       particles[ index( u, v ) ],
      //       particles[ index( u, v + 1 ) ],
      //       restDistance
      //     ] );
      //   }
      //
      // if(u<w && (v == 0 || v == h)){
      //   constrains.push( [
      //     particles[ index( u, v ) ],
      //     particles[ index( u + 1, v ) ],
      //     restDistance
      //   ] );
      // }
    }
  }

  // structural springs: each particle can only be a certain distance
  // from neighboring particles, allows for movement without disintegration
  // of the "material" and gives "springy" feel

  if (structuralSprings) {
    for (v = 0; v < h; v++) {
      for (u = 0; u < w; u++) {
        constraints.push([
          particles[index(u, v)],
          particles[index(u, v + 1)],
          particles[index(u + 1, v)],
          restDistance
        ]);
      }
    }
  }

  function index(u,v) {
    return u+v*(w+1);
  }
}

function map(n, start1, stop1, start2, stop2) {
  return ((n-start1)/(stop1-start1)) * (stop2-start2) + start2;
}

function simulate(time) {
  if (!lastTime) {
    lastTime = time;
    return;
  }

  var i, il, particles, particle, constraints, constraint;

  for (particles = cloth.particles, i=0, il=particles.length; i<il; i++) {
    particle = particles[i];
    particle.addForce(gravity);
    particle.integrate(TIMESTEP_SQ); // verlet integration
  }

  constraints = cloth.constraints;
  il = constraints.length;
  for (i=0; i<il; i++) {
    constraint = constraints[i];
    satisfyConstraints(constraint[0], constraint[1], constraint[2], constraint[3]);
  }
}
