const { Engine, World, Bodies, Constraint, MouseConstraint, Mouse } = Matter

const engine = Engine.create();
const world = engine.world;

/** @type {Pendulum} */
let p1
/** @type {Pendulum} */
let p2;

function setup() {
  const cnv = createCanvas(500, 500);

  rectMode(CORNER);

  let btn = createButton("Clear");
  btn.mousePressed(() => {
    p2.history = [];
  })

  cnv.pos = cnv.position()
  btn.class("button-primary")
  btn.position(cnv.pos.x + 10, cnv.pos.y + height - 10 - btn.elt.offsetHeight)

  p1 = new Pendulum({ x: width / 2, y: 0 })
  p2 = new Pendulum(p1.bob, undefined, 40, true)
  let mouse = Mouse.create(cnv.elt)
  mouse.pixelRatio = pixelDensity();
  let mi = MouseConstraint.create(engine, { mouse })
  World.add(world, mi)
}


function draw() {
  background(51);
  fill(255);
  noStroke();
  text("Use the mouse to move the bobs!", 10, 20)

  p1.show();
  p2.show();

  noFill();
  stroke(255)
  beginShape();
  p2.history.forEach(pt => vertex(pt.x, pt.y))
  endShape();

  Engine.update(engine)

}

class Pendulum {
  constructor(posOrBody, len = random(70, 180), bobSize = 30, saveHistory = false) {
    let x = posOrBody.x ?? posOrBody.position.x;
    let y = posOrBody.y ?? posOrBody.position.y;
    let key = "bodyA"
    if (posOrBody.x != undefined) {
      key = "pointA"
    }
    this.bobSize = bobSize;
    this.bob = Bodies.circle(x + len, y + random(-20, 20), bobSize, {
      mass: bobSize,
      frictionAir: 0
    })
    this.constraint = Constraint.create({
      [key]: posOrBody,
      bodyB: this.bob,
      stiffness: 0.3
    })
    if (saveHistory) {
      this.history = [];
    }
    World.add(world, [this.bob, this.constraint])
  }
  get radius() {
    return this.bobSize;
  }
  get pointA() {
    let con = this.constraint
    return {
      x: (con.bodyA?.position?.x || 0) + con.pointA.x,
      y: (con.bodyA?.position?.y || 0) + con.pointA.y
    }
  }
  get pointB() {
    let con = this.constraint
    return {
      x: (con.bodyB?.position?.x || 0) + con.pointB.x,
      y: (con.bodyB?.position?.y || 0) + con.pointB.y
    }
  }
  show() {
    this.history?.push({ x: this.bob.position.x, y: this.bob.position.y })
    push();
    stroke(255);
    line(this.pointA.x, this.pointA.y, this.pointB.x, this.pointB.y)
    noStroke();
    fill(255);
    ellipse(this.bob.position.x, this.bob.position.y, this.bobSize)
    pop();
    if (this.history?.length > 300) {
      this.history.shift();
    }
  }
}
