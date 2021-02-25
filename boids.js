let width = 150;
let height = 150;

const numBoids = 100;
const visualRange = 100;
const DRAW_TRAIL = false;

var boids = [];

//initialize boid positions and velocities
function init() {
  for (var i=0; i< numBoids; i++) {
    boids[boids.length] = {
      x: Math.random() * width,
      y: Math.random() * height,
      dx: Math.random() * 10 - 5,
      dy: Math.random() * 10 - 5,
      history: [],
    };
  }
}

//Euclidean distance between 2 boids
function getDist(boid1, boid2) {
  return Math.sqrt(
    Math.pow(boid1.x - boid2.x, 2) + Math.pow(boid1.y - boid2.y, 2),
  );
}

//returns n closest boids
function nClosest(boid, n) {
  const sorted = boids.slice();
  sorted.sort((a,b) => getDist(boid, a) - getDist(boid, b));
  return sorted.slice(1, n+1);
}

function sizeCanvas() {
  const canvas = document.getElementById("boids");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

//keeps the boids away from the edges of the window
function stayInBounds(boid) {
  const margin = 200;
  const turnFactor = 1;

  if (boid.x < margin) {
    boid.dx += turnFactor;
  }
  if (boid.x > width - margin) {
    boid.dx -= turnFactor;
  }
  if (boid.y < margin) {
    boid.dy += turnFactor;
  }
  if (boid.y > height - margin) {
    boid.dy -= turnFactor;
  }
}

//Move towards the center of all boids in visual range
function flyTowardsCenter(boid) {
  const centeringFactor = 0.005;

  let centerX = 0;
  let centerY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
    if (getDist(boid, otherBoid) < visualRange) {
      centerX += otherBoid.x;
      centerY += otherBoid.y;
      numNeighbors++;
    }
  }

  if (numNeighbors > 0) {
    centerX /= numNeighbors;
    centerY /= numNeighbors;

    boid.dx += (centerX - boid.x) * centeringFactor;
    boid.dy += (centerY - boid.y) * centeringFactor;
  }
}

//avoid other boids within the range minDist
function avoidOthers(boid) {
  const minDist = 20;
  const avoidFactor = 0.05;
  let moveX = 0;
  let moveY = 0;

  for (let otherBoid of boids) {
    if (otherBoid !== boid) {
      if (getDist(boid, otherBoid) < minDist) {
        moveX += boid.x - otherBoid.x;
        moveY += boid.y - otherBoid.y;
      }
    }
  }

  boid.dx += moveX * avoidFactor;
  boid.dy += moveY * avoidFactor;
}

//adjust velocity to match the velocity of other boids in visual range
function matchVelocity(boid) {
  const velocityFactor = 0.05;

  let avgDX = 0;
  let avgDY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
    if (getDist(boid, otherBoid) < visualRange) {
      avgDX += otherBoid.dx;
      avgDY += otherBoid.dy;
      numNeighbors++;
    }
  }

  if (numNeighbors > 0) {
    avgDX /= numNeighbors;
    avgDY /= numNeighbors;

    boid.dx += (avgDX - boid.dx) * velocityFactor;
    boid.dy += (avgDY - boid.dy) * velocityFactor;
  }
}

//limit speed so the boids cannot go arbitrarily fast
function limitSpeed(boid) {
  const speedLimit = 15;

  const speed = Math.sqrt(Math.pow(boid.dx, 2) + Math.pow(boid.dy, 2));
  if (speed > speedLimit) {
    boid.dx = (boid.dx / speed) * speedLimit;
    boid.dy = (boid.dy / speed) * speedLimit;
  }
}

//draw a boid to the screen
function drawBoid(ctx, boid) {
  const angle = Math.atan2(boid.dy, boid.dx);
  ctx.translate(boid.x, boid.y);
  ctx.rotate(angle);
  ctx.translate(-boid.x, -boid.y);
  ctx.fillStyle = "#558cf4";
  ctx.beginPath();
  ctx.moveTo(boid.x, boid.y);
  ctx.lineTo(boid.x - 15, boid.y + 5);
  ctx.lineTo(boid.x - 15, boid.y - 5);
  ctx.lineTo(boid.x, boid.y);
  ctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (DRAW_TRAIL) {
    ctx.strokeStyle = "#558cf466";
    ctx.beginPath();
    ctx.moveTo(boid.history[0][0], boid.history[0][1]);
    for (const point of boid.history) {
      ctx.lineTo(point[0], point[1]);
    }
    ctx.stroke();
  }
}

//animation loop
function animationLoop() {
  for (let boid of boids) {
    flyTowardsCenter(boid);
    avoidOthers(boid);
    matchVelocity(boid);
    limitSpeed(boid);
    stayInBounds(boid);

    boid.x += boid.dx;
    boid.y += boid.dy;
    boid.history.push([boid.x, boid.y]);
    boid.history = boid.history.slice(-50);
  }

  const ctx = document.getElementById("boids").getContext("2d");
  ctx.clearRect(0, 0, width, height);

  for (let boid of boids) {
    drawBoid(ctx, boid);
  }

  window.requestAnimationFrame(animationLoop);
}

window.onload = () => {
  window.addEventListener("resize", sizeCanvas, false);
  sizeCanvas();

  init();

  window.requestAnimationFrame(animationLoop);
};