const TWO_PI = 2 * Math.PI;
// const F = 0.2;


// pendulum
createPendulum = function(xx, yy, size, length) {
    var Composite = Matter.Composite,
        Constraint = Matter.Constraint,
        Bodies = Matter.Bodies;

    var pendulum = Composite.create({ label: 'Pendulum' });

    var circle = Bodies.circle(xx, yy + length, size, { inertia: Infinity, frictionAir: 0.0001});
    var constraint = Constraint.create({ pointA: { x: xx, y: yy }, bodyB: circle });

    Composite.addBody(pendulum, circle);
    Composite.addConstraint(pendulum, constraint);

    return pendulum;
};

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
    Vector = Matter.Vector;

// create an engine
var engine = Engine.create(),
    world = engine.world;

var default_category = 0x0001, rain_category = 0x0002;

var rain_option = {collisionFilter: {mask: rain_category},
                  frictionAir: 0.15};
var board_option = {collisionFilter: {mask: default_category},
                    isStatic: true};
var ball_option = {collisionFilter: {mask: default_category},
                    restitution: 0.75};

// create a renderer
var render = Render.create({
    element: document.getElementById("game_container"),
    engine: engine,
    options: {
        width: 800,
        height: 600,
        showAngleIndicator: false,
        showVelocity: true
    }
});

var keys = [];
document.body.addEventListener("keydown", function(e) {
  keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function(e) {
  keys[e.keyCode] = false;
});

// create two boxes and a ground
const pendulum = createPendulum(render.options.width/2, 300, 25, 200);
const ball = pendulum.bodies[0];

// add all of the bodies to the world
Composite.add(world, [pendulum]);

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });
Composite.add(world, mouseConstraint);
render.mouse = mouse;

// run the engine
// Engine.run(engine);
var runner = Runner.create();

Events.on(runner, "beforeUpdate", function(e) {
    

    const from = Vector.create(ball.position.x, ball.position.y);
    const force = 0.8e-3;
    if (keys[37]) {
        const ball_force = Vector.create(-force, 0);
        Body.applyForce(ball, from, ball_force);
    };
    if (keys[39]){
        const ball_force = Vector.create(force, 0);
        Body.applyForce(ball, from, ball_force);
    };

    if (face_expression == 6 || face_expression == 4) {
        const ball_force = Vector.create(-force, 0);
        Body.applyForce(ball, from, ball_force);
    };
    if (face_expression == 3) {
        const ball_force = Vector.create(force, 0);
        Body.applyForce(ball, from, ball_force);
    };

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

    requestAnimationFrame(draw);
}

draw();

// run the renderer
Render.run(render);