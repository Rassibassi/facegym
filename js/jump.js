const TWO_PI = 2 * Math.PI;
// const F = 0.2;

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    Composite = Matter.Composite,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Vector = Matter.Vector,
    Vertices = Matter.Vertices;

// create an engine
var engine = Engine.create(),
    world = engine.world;

// create a renderer
var render = Render.create({
    element: document.getElementById("game_container"),
    engine: engine,
    options: {
        width: 800,
        height: 600,
        showAngleIndicator: false,
        showVelocity: false,
        showAxes: false,
        showPositions: false,
        showConvexHulls: false
    }
});

var keys = [];
document.body.addEventListener("keydown", function(e) {
  keys[e.keyCode] = true;
  console.log(e.keyCode)
});
document.body.addEventListener("keyup", function(e) {
  keys[e.keyCode] = false;
});

function create_ball(){
    return Bodies.circle(50, 50, 10, {friction: 0.0});
}

// create two boxes and a ground
// const ramp = Bodies.rectangle(200, 200, 300, 10, {isStatic: true});

function concave_circle_vertices(thickness, radius, N, callback){
    const ts = [];
    for(let i = 0; i < N; i++) {
        const t = callback(i, N);// Math.PI / 2 - Math.PI / 2 * i / N;
        ts.push(t);
    };

    const xs = ts.map(Math.cos);
    const ys = ts.map(Math.sin);

    const mult = radius => m => (radius * m).toString();

    const outer_xs = xs.map(mult(radius + thickness));
    const outer_ys = ys.map(mult(radius + thickness));
    let outer_ps = outer_xs.map((e, i) => {
      return [e, outer_ys[i]];
    });
    outer_ps = outer_ps.reverse();
    const inner_xs = xs.map(mult(radius));
    const inner_ys = ys.map(mult(radius));
    const inner_ps = inner_xs.map((e, i) =>{
      return [e, inner_ys[i]];
    });
    const all_ps = inner_ps.concat(outer_ps).flat();
    const vertices = Vertices.fromPath(all_ps.join(' '));

    return vertices;
};

const jump_vert = concave_circle_vertices(10, 100, 10, (i, N) => Math.PI / 2 * (1 - i / N));
const catcher_vert = concave_circle_vertices(10, 30, 40, (i, N) => -0.5*Math.PI + Math.PI * 2 * 13/16 * i / N);

const ramp_length = 300;

const jump = Bodies.fromVertices(0, 0, jump_vert, {friction: 0.0, isStatic: true});
const vert_x = Math.min(...jump.vertices.map(vert => vert.x));
const ramp_x = Math.min(...jump.parts.map(part => part.position.x));
const ramp_y = Math.max(...jump.parts.map(part => part.position.y));
const ramp = Bodies.rectangle(vert_x - ramp_length / 2, ramp_y, ramp_length, 10, {friction: 0.0, isStatic: true});

const catcher = Bodies.fromVertices(750, 550, catcher_vert, {isStatic: true});

var collider = Bodies.circle(catcher.position.x - 5, catcher.position.y - 5, 20, {
    isSensor: true,
    isStatic: true,
    render: { visible: false }
});

const big_ramp = Composite.create();
Composite.add(big_ramp, jump);
Composite.add(big_ramp, ramp);
Composite.translate(big_ramp, Vector.create(285, 280));
Composite.rotate(big_ramp, Math.PI / 4, Vector.create(jump.position.x, jump.position.y));

console.log(big_ramp.bodies[0].position);
console.log(big_ramp.bodies[1].position);

var balls = Composite.create();
Composite.add(balls, create_ball());

// add all of the bodies to the world
Composite.add(world, [big_ramp, balls, catcher, collider]);


Events.on(engine, 'collisionStart', function(event) {
    const pairs = event.pairs;
    let scored = false;
    for (let i = 0, j = pairs.length; i != j; ++i) {
        const pair = pairs[i];

        if (pair.bodyA === collider) {
            scored = true;
        } else if (pair.bodyB === collider) {
            scored = true;
        };
    };
    if (scored) {
        console.log("Colision");
        const ball = balls.bodies[0];
        if(ball !== undefined) {
            setTimeout(() => {
                Composite.remove(balls, ball);
            }, 1250);
        };
    };
});

// run the engine
var runner = Runner.create();

Events.on(runner, "beforeUpdate", function(e) {
    const ball = balls.bodies[0];
    if(ball !== undefined) {
        const from = Vector.create(ball.position.x, ball.position.y);
        const force = 5e-4;
        if (keys[39]) {
            const ball_force = Vector.create(0, force);
            Body.applyForce(ball, from, ball_force);
        };
        if (face_expression == 6 || face_expression == 4) {
            const ball_force = Vector.create(0, force);
            Body.applyForce(ball, from, ball_force);
        };

        if(ball.position.y > render.options.height){
            Composite.remove(balls, ball);
        };
    } else {
        if (keys[66]){
            Composite.add(balls, create_ball());
        };
    };
    

    // if (face_expression == 6 || face_expression == 4) {
    //     const ball_force = Vector.create(-force, 0);
    //     Body.applyForce(ball, from, ball_force);
    // };
    // if (face_expression == 3) {
    //     const ball_force = Vector.create(force, 0);
    //     Body.applyForce(ball, from, ball_force);
    // };

    // console.log(face_expression);

    // Body.rotate(balance_board, rotation)
    
    // // random force to the left (from right edge center, affects torque?)
    // let from = Vector.create(render.options.width, render.options.height/2)
    // let ball_force = Vector.create(Common.random(-1e-5, 2e-5), 0)
    // let rain_force = Vector.mult(ball_force, 0.1);

    // if(balls.bodies.length == 1){
    //     const ball = balls.bodies[0];
    //     Body.applyForce(ball, from, ball_force);
    //     if(ball.position.y > render.options.height){
    //         Composite.remove(balls, ball);
    //     };
    // }

    // // all bodies affected by the wind
    // rain.bodies.forEach(function(body) {
    //     Body.applyForce(body, from, rain_force)
    // })

    // var rand_x = Common.random(-1.2*render.options.width, 1.2*render.options.width);
    // var drop = Bodies.circle(rand_x, 0, 0.5, rain_option);
    // Composite.add(rain, drop);
    // // all bodies affected by the wind
    // rain.bodies.forEach(function(drop) {
    //     if(drop.position.y > render.options.height){
    //         Composite.remove(rain, drop);
    //     };    
    // });
});

function draw(delta){
    Runner.tick(runner, engine, 1000/60);
    // Render.lookAt(render, {
    //     position: { x: ball.position.x, y: ball.position.y },
    // });

    requestAnimationFrame(draw);
}

draw();

// run the renderer
Render.run(render);