const { Engine, World, Bodies, Constraint, MouseConstraint, Mouse, Body } = Matter

const engine = Engine.create();
const world = engine.world;
console.log(Body)

/** @type {Pendulum} */
let p1
/** @type {Pendulum} */
let p2;

const scaleIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Create a new synth
//const synthA = new Tone.Synth().toDestination();
const synthB = new Tone.Synth().toDestination();
const synthC = new Tone.Synth().toDestination();

// synthA.triggerAttack(0); // Start the sound
// synthB.triggerAttack(0); // Start the sound
// synthC.triggerAttack(0); // Start the sound

var ticks = 0;
var modulo = 10000;
var baseFreq = 0;
var bob2Freq = 0;
var bob3Freq = 0;

var bob1Reset = true;
var bob2Reset = true;
var bob3Reset = true;

// CREDIT: professor's code
function calcNote (rootFreq, num) {
  const ratios = [
     1,      // unison ( 1/1 )       // C
     9/8,    // major second         // D
     5/4,    // major third          // E
     4/3,    // fourth               // F
     3/2,    // fifth                // G
     5/3,    // major sixth          // A
     15/8,   // major seventh        // B
     2       // octave ( 2/1 )       // C
  ]
  let freq = rootFreq * ratios[num]
  return freq
}

function setup() {
  const cnv = createCanvas(1000, 570);

  rectMode(CORNER);

  let btn = createButton("Clear");
  btn.mousePressed(() => {
    p2.history = [];
  })

  cnv.pos = cnv.position()
  btn.class("button-primary")
  btn.position(cnv.pos.x + 10, cnv.pos.y + height - 10 - btn.elt.offsetHeight)

  p1 = new Pendulum({ x: width / 2, y: 0 })
  p2 = new Pendulum(p1.bob, 170, 40, true)
  p3 = new Pendulum(p2.bob, 170, 40, true)
  let mouse = Mouse.create(cnv.elt)
  mouse.pixelRatio = pixelDensity();
  let mi = MouseConstraint.create(engine, { mouse })
  World.add(world, mi)
}


function getBobTone(bobNumber) {
  return scaleIndexToNote[document.getElementById(`bob${bobNumber}`).value] + (document.getElementById(`scale`).value == "" ? 4 : document.getElementById(`scale`).value)//gets the oninput value
}

function getRandomTone(bobNumber) {
  return scaleIndexToNote[Math.floor(Math.random() * 11).toString()] + (document.getElementById(`scale`).value == "" ? 4 : document.getElementById(`scale`).value)//gets the oninput value
}

function getBaseFreq() {
  return document.getElementById(`basefreq`).value//gets the oninput value
}

function getDrift() {
  return document.getElementById(`drift`).value//gets the oninput value
}

function draw() {
  background(51);
  fill(255);
  noStroke();

  if (getBaseFreq() != baseFreq) {
    baseFreq = getBaseFreq()
    bob2Freq = calcNote(baseFreq, Math.floor(Math.random() * 6) + 1)
    bob3Freq = calcNote(baseFreq, Math.floor(Math.random() * 6) + 1)
  }

  if ((getDrift() != 0)) {
    modulo = 1000 - 100 * getDrift()
  } else {
    modulo = Infinity
  }
 

  if ((getDrift() != 0) && (ticks % modulo == 0)) {
    if (Math.floor(Math.random() * 2) == 0) {
      bob2Freq = calcNote(baseFreq, Math.floor(Math.random() * 6) + 1)
    } else{
      bob3Freq = calcNote(baseFreq, Math.floor(Math.random() * 6) + 1)
    }
    ticks = 0
  }

  if (p1.bob.speed.toFixed(2) < 0.37) {
    bob1Reset = true
  }
  if (p2.bob.speed.toFixed(2) < 0.37) {
    bob2Reset = true
  }
  if (p3.bob.speed.toFixed(2) < 0.37) {
    bob3Reset = true
  }

  text("Use the mouse to move the bobs!", 10, 20)
  text(`Pendulum 1\nSpeed: ${p1.bob.speed.toFixed(2)}, Freq: ${Number(baseFreq).toFixed(1)} ${p1.bob.position.x.toFixed(2)} ${bob1Reset} ${(5 ** ((p1.bob.speed.toFixed(2) * 10) ** 0.25)).toFixed(1)} ${p1.bob.velocity.x.toFixed(2)}`, 10, 45)
  text(`Pendulum 2\nSpeed: ${p2.bob.speed.toFixed(2)}, Freq: ${(bob2Freq).toFixed(1)} ${p2.bob.position.x.toFixed(2)} ${bob2Reset} ${(5 ** ((p2.bob.speed.toFixed(2) * 10) ** 0.25)).toFixed(1)}`, 10, 95)
  text(`Pendulum 3\nSpeed: ${p3.bob.speed.toFixed(2)}, Freq: ${(bob3Freq).toFixed(1)} ${p3.bob.position.x.toFixed(2)} ${bob3Reset} ${(5 ** ((p3.bob.speed.toFixed(2) * 10) ** 0.125)).toFixed(1)}`, 10, 145)
  text(`Clock info\nTicks: ${ticks %  modulo}, Modulo: ${modulo}`, 10, 195)
  ticks += 1
  // synthA.set({
  //   volume: -((p1.bob.speed.toFixed(2) * 10) ** 2.0)
  // });
  // synthB.set({
  //   volume: -((p2.bob.speed.toFixed(2) * 10) ** 1.5)
  // });
  // synthC.set({
  //   volume: -((p3.bob.speed.toFixed(2) * 10) ** 1.5)
  // });
  
  if (p1.bob.position.x <= 505 && p1.bob.position.x >= 495 && bob1Reset) {
    const synthA = new Tone.Synth().toDestination();
    bob1Reset = false;
    synthA.set({
      volume: -0.7 //-((p1.bob.speed.toFixed(2) * 10) ** 2.0)
    });
    synthA.set({
      envelope : {
      attack : 0.05,
      decay : 5 ** ((p1.bob.speed.toFixed(2) * 10) ** 0.35),
      sustain : 0,
      release : 5 ** ((p1.bob.speed.toFixed(2) * 10) ** 0.35)
    }});
    console.log("PLAYING A")
    synthA.triggerAttackRelease(baseFreq)
    setTimeout(() => {
      synthA.dispose();
    }, 7000);
  }

  if (p2.bob.position.x <= 505 && p2.bob.position.x >= 495 && bob2Reset) {
    const synthB = new Tone.Synth().toDestination();
    bob2Reset = false;
    synthB.set({
      volume: -0.7 //-((p2.bob.speed.toFixed(2) * 10) ** 1.5)
    });
    synthB.set({
      envelope : {
      attack : 0.05,
      decay : 5 ** ((p2.bob.speed.toFixed(2) * 10) ** 0.25),
      sustain : 0,
      release : 5 ** ((p2.bob.speed.toFixed(2) * 10) ** 0.25)
    }});
    console.log("PLAYING B")
    synthB.triggerAttackRelease(bob2Freq)
    setTimeout(() => {
      synthB.dispose();
    }, 7000);
  }

  if (p3.bob.position.x <= 505 && p3.bob.position.x >= 495 && bob3Reset) {
    const synthC = new Tone.Synth().toDestination();
    bob3Reset = false;
    synthC.set({
      volume: -0.7 //-((p2.bob.speed.toFixed(2) * 10) ** 1.5)
    });
    synthC.set({
      envelope : {
      attack : 0.05,
      decay : 5 ** ((p3.bob.speed.toFixed(2) * 10) ** 0.2),
      sustain : 0,
      release : 5 ** ((p3.bob.speed.toFixed(2) * 10) ** 0.2)
    }});
    console.log("PLAYING C")
    synthC.triggerAttackRelease(bob3Freq)
    setTimeout(() => {
      synthC.dispose();
    }, 7000);
  }
 

  // synthB.set({
  //   envelope : {
  //   attack : 0.05,
  //   decay : (p2.bob.speed.toFixed(2) * 10) ** 2.0,
  //   sustain : 0,
  //   release : (p2.bob.speed.toFixed(2) * 10) ** 2.0
  // }});

  // synthC.set({
  //   envelope : {
  //   attack : 0.05,
  //   decay : (p3.bob.speed.toFixed(2) * 10) ** 2.0,
  //   sustain : 0,
  //   release : (p3.bob.speed.toFixed(2) * 10) ** 2.0
  // }});

  p1.bob.frictionAir = 0.015 - 0.0025 * document.getElementById(`bob1friction`).value
  p2.bob.frictionAir = 0.015 - 0.0025 * document.getElementById(`bob2friction`).value
  p3.bob.frictionAir = 0.015 - 0.0025 * document.getElementById(`bob3friction`).value



  // synthA.set({
  //   frequency: baseFreq
  // });
  // synthB.set({
  //   frequency: bob2Freq
  // });
  // synthC.set({
  //   frequency: bob3Freq
  // });
  

  p1.show();
  p2.show();
  p3.show();

  noFill();
  stroke(255)
  beginShape();
  //p2.history.forEach(pt => vertex(pt.x, pt.y))
  p3.history.forEach(pt => vertex(pt.x, pt.y))
  endShape();

  Engine.update(engine)

}

class Pendulum {
  constructor(posOrBody, len = random(70, 180), bobSize = 30, saveHistory = false) {
    // len can be random:  len = random(70, 180)
    let x = posOrBody.x ?? posOrBody.position.x;
    let y = posOrBody.y ?? posOrBody.position.y;
    let key = "bodyA"
    if (posOrBody.x != undefined) {
      key = "pointA"
    }
    this.bobSize = bobSize;
    this.bob = Bodies.circle(x + len, y + random(-20, 20), bobSize, {
      mass: bobSize * 100 * 1000 * 1000,
      isStatic: false,
      frictionAir: -0.005,
      friction: 0,
      frictionStatic: 0,
      restitution: 1, 
      inertia: Infinity
    })
    this.constraint = Constraint.create({
      [key]: posOrBody,
      bodyB: this.bob,
      stiffness: 1
    })
    if (saveHistory) {
      this.history = [];
    }
    World.add(world, [this.bob, this.constraint])
  }
  get radius() {
    return this.bob.circleRadius;
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