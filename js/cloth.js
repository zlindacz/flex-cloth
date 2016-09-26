// var guiEnabled = true;

var DAMPING = 0.03;
var DRAG = 1 - DAMPING;
var MASS = 0.1;

var structuralSprings = true;
var restDistance = 2;
var friction = 0.9; // 0 = frictionless, 1 = sticky cloth

var xSegs = 30; // how many particles wide is the cloth
var ySegs = 30; // how many particles tall is the cloth
var fabricLength = 500; // size of cloth

var GRAVITY = 9.81 * 50;
var gravity = new THREE.Vector3( 0, -GRAVITY, 0 ).multiplyScalar( MASS );
var TIMESTEP = 18 / 1000;
var TIMESTEP_SQ = TIMESTEP * TIMESTEP;

// var wind = true;
// var windStrength = 2;
// var windForce = new THREE.Vector3( 0, 0, 0 );

// var clothInitialPosition = plane(restDistance * xSegs, restDistance * ySegs);
var clothInitialPosition = plane(400, 400);
var cloth = new Cloth(xSegs, ySegs, fabricLength);
var pos;
// var tmpForce = new THREE.Vector3(); // for wind calc

var diff = new THREE.Vector3();


function plane(width, height) {
  return function(u, v) {
    // var x = (u - 0.5) * width;
    // var y = (v + 0.5) * height;
    // var z = 0;

    var x = u * width - width/2;
    // var y = 50; //height/2;
    var y = 75;
    // var z = v * height - height/2;
    var z = v * height - height/2;

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
  newPos.multiplyScalar(DRAG).add(this.position);
  newPos.add(this.acceleration.multiplyScalar(timesq));

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
  this.w = w;
  this.h = h;
  restDistance = l/w;

  var particles = [];
  var constraints = [];

  var u, v;

  // create particles: each pixel of the cloth is a particle
  // that has mass and responds to forces

  for (v = 0; v <= h; v++ ) {
    for (u = 0; u <= w; u++) {
      particles.push(new Particle( u/w, v/h, 0, MASS ));
    }
  }

  // structural springs: each particle can only be a certain distance
  // from neighboring particles, allows for movement without disintegration
  // of the "material" and gives "springy" feel

  // if (structuralSprings) {
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
    this.particles = particles;
    this.constraints = constraints;
  // }

  function index(u,v) {
    return u+v*(w+1);
  }
  this.index = index;
}

// function map(n, start1, stop1, start2, stop2) {
//   return ((n-start1)/(stop1-start1)) * (stop2-start2) + start2;
// }

// cube position, using floor distance
// var cubeDimension = 50;
// var cubePosition = new THREE.Vector3(0, cubeDimension, 0);
// var prevCubePosition = new THREE.Vector3(0, cubeDimension, 0);

var a, b, c, d, e, f;
function initializeBounds(box) {
  a = box.min.x;
  b = box.min.y;
  c = box.min.z;
  d = box.max.x;
  e = box.max.y;
  f = box.max.z;
}

var nearestX, nearestY, nearestZ;
var currentX, currentY, currentZ;
var xDist, yDist, zDist;
// var randomPoints = [];
// var rand, randX, randY;


// for movements and constraints
var lastTime;
var whereAmI, whereWasI;
var posFriction = new THREE.Vector3(0,50,0);
var posNoFriction = new THREE.Vector3(0,50,0);

function simulate(time) {
  if (!lastTime) {
    lastTime = time;
    return;
  }

  // cloth responds to gravity
  var i, il, particles, particle, constraints, constraint;
  for (particles = cloth.particles, i=0, il=particles.length; i<il; i++) {
    particle = particles[i];
    particle.addForce(gravity);
    particle.integrate(TIMESTEP_SQ); // verlet integration
  }

  // constraints, so cloth stays in visible and area and behaves like cloth
  constraints = cloth.constraints;
  il = constraints.length;
  for (i=0; i<il; i++) {
    constraint = constraints[i];
    satisfyConstraints(constraint[0], constraint[1], constraint[2]);
  }

  // Floor Constaints
  for (particles = cloth.particles, i = 0, il = particles.length; i < il; i++) {
    particle = particles[i];
    pos = particle.position;
    if (pos.y < -99) {
      pos.y = -99;
    }
  }

  // avoid self intersection so cloth can fold onto itself
  for (i=0; i<cloth.particles.length; i++) {
    p_i = particles[i];
    for (j=0; j<cloth.particles.length; j++) {
      p_j = particles[j];
      repelParticles(p_i, p_j, restDistance);
    }
  }

  // cloth sits atop cube, doesn't fall through
  for (particles = cloth.particles, i=0, il=particles.length; i < il; i++) {
    particle = particles[i];
    whereAmI = particle.position;
    whereWasI = particle.previous;

    if (boundingBox.containsPoint(whereAmI)) {
      // we have collided with the cube
      currentX = whereAmI.x;
      currentY = whereAmI.y;
      currentZ = whereAmI.z;

      if(currentX <= (a + d)/2){nearestX = a;}
      else{nearestX = d;}

      if(currentY <= (b + e)/2){nearestY = b;}
      else{nearestY = e;}

      if(currentZ <= (c + f)/2){nearestZ = c;}
      else{nearestZ = f;}

      xDist = Math.abs(nearestX-currentX);
      yDist = Math.abs(nearestY-currentY);
      zDist = Math.abs(nearestZ-currentZ);

      posNoFriction.copy(whereAmI);

      if(zDist<=xDist && zDist<=yDist)
      {
        posNoFriction.z = nearestZ;
      }
      else if(yDist<=xDist && yDist<=zDist)
      {
        posNoFriction.y = nearestY;
      }
      else if(xDist<=yDist && xDist<=zDist)
      {
        posNoFriction.x = nearestX;
      }

      if(!boundingBox.containsPoint(whereWasI)){
        // with friction behavior:
        // set particle to its previous position
        posFriction.copy(whereWasI);
        whereAmI.copy(posFriction.multiplyScalar(friction).add(posNoFriction.multiplyScalar(1-friction)));
      }
      else{
        whereAmI.copy(posNoFriction);
      }
    }
  }
}



  //   diff.subVectors(whereAmI, cubePosition);
  //   if (diff.length() < cubeDimension) {
  //     // if collided with model, make sure cloth doesn't go inside
  //
  //     // no friction behavior:
  //     // project point out to nearest point on model surface
  //     diff.normalize().multiplyScalar(cubeDimension);
  //     posNoFriction.copy(cubePosition).add(diff);
  //
  //     diff.subVectors(whereWasI, cubePosition);
  //
  //     if (diff.length() > cubeDimension) {
  //       // with friction behavior:
  //       // add the distance that the sphere moved in the last frame
  //       // to the previous position of the particle
  //       diff.subVectors(cubePosition, prevCubePosition);
  //       posFriction.copy(whereWasI).add(diff);
  //
  //       posNoFriction.multiplyScalar(1-friction);
  //       posFriction.multiplyScalar(friction);
  //       whereAmI.copy(posFriction.add(posNoFriction));
  //     } else {
  //       whereAmI.copy(posNoFriction);
  //     }
  //   }
  // }
