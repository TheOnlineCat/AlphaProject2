const Application = PIXI.Application;
const Renderer = PIXI.Renderer;
const Graphics = PIXI.Graphics;
const app = new Application({
    width: 500,
    height: 500,
    transparent: false,
    antialias: true
});

app.renderer.background.color = 0x23395D;
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = "absolute";
document.body.appendChild(app.view);


mouseCoords = {x: 0, y: 0};

app.stage.on('mousemove', (event) =>
{
    mouseCoords.x = event.global.x;
    mouseCoords.y = event.global.y;
});

function createBunny() {
    // create our little bunny friend..
    const bunny = new PIXI.Sprite(PIXI.Texture.from('https://pixijs.com/assets/bunny.png'));

    // enable the bunny to be interactive... this will allow it to respond to mouse and touch events
    bunny.eventMode = 'static';

    // this button mode will mean the hand cursor appears when you roll over the bunny with your mouse
    bunny.cursor = 'pointer';

    // center the bunny's anchor point
    bunny.anchor.set(0.5);

    // make it a bit bigger, so it's easier to grab
    bunny.scale.set(1);

    // setup events for mouse + touch using
    // the pointer events
    //bunny.on('pointerdown', onDragStart, bunny);

    // move the sprite to its designated position
    bunny.x = app.screen.width/2;
    bunny.y = app.screen.height/2;

    // add it to the stage
    app.stage.addChild(bunny);
}

function createPeg() {
    let diameter = 15;

    const gr = new PIXI.Graphics();  
        gr.beginFill(0xFFFFFF);
        gr.lineStyle(0);
        gr.drawCircle(30, 30, 30);
        gr.endFill();

    const texture = app.renderer.generateTexture(gr);
    const peg = new PIXI.Sprite(texture);

    peg.position.set(app.screen.width/2, app.screen.height/2);
    peg.width = diameter;
    peg.height = diameter;
    peg.tint = 0xFF0000;
    peg.acceleration = new PIXI.Point(0);

    return peg;
}


function drawBoard(levels) {
    let gap = 50;
    let startingHeight = (app.screen.height / 2) - (gap * levels)/2;
    let startingWidth = app.screen.width / 2;
    
    for (let i = 0; i < levels; i++) {
        let currentHeight = startingHeight + (45 * i);
        for (let i2 = 0; i2 <= i; i2++ ) {
            let pegObject = createPeg();
            pegObject.y = currentHeight;
            pegObject.x = (i2 * gap ) + (startingWidth - gap * i/2) - (pegObject.width/2)
            app.stage.addChild(pegObject);
        }
    }
}

function drawBuckets(levels, pegGap) {
    let gap = 10;
    let width = pegGap - gap;
    let screen = {x: app.screen.width / 2, y: app.screen.height / 2};

    for(let i = 0; i <= levels; i++) {
        const rect = new PIXI.Graphics();
        rect.beginFill(0xFFFFFF)
        .drawRect(
            ((width + gap) * i) + (screen.x - width/2) - (gap + width) * levels/2,
            screen.y - (45 * levels)/2 + (40 * (levels)),
            width, 
            20
            )
        .endFill();

        app.stage.addChild(rect);
    }
}

drawBuckets(10, 50);

drawBoard(10);


Math.dist = (p1, p2) =>
{
    const a = p1.x - p2.x;
    const b = p1.y - p2.y;

    return Math.hypot(a, b);
}

function testForAABB(object1, object2)
{
    const bounds1 = object1.getBounds();
    const bounds2 = object2.getBounds();

    return bounds1.x < bounds2.x + bounds2.width
        && bounds1.x + bounds1.width > bounds2.x
        && bounds1.y < bounds2.y + bounds2.height
        && bounds1.y + bounds1.height > bounds2.y;
}






app.ticker.add((delta) => Update(delta));


class Ball extends PIXI.Sprite{ 
    static diameter = 30
    static terminalVelocity = 98
    static gravity = 9.8

    velocity = 0;
    

    constructor() {
        const gr = new PIXI.Graphics();  
            gr.beginFill(0xFFFFFF);
            gr.lineStyle(0);
            gr.drawCircle(30, 30, 30);
            gr.endFill();
    
        const texture = app.renderer.generateTexture(gr);

        super(texture);
        
        this.position.set(app.screen.width/2 - Ball.diameter/2, -200);
        this.width = Ball.diameter;
        this.height = Ball.diameter;
        this.tint = 0xFFFF00;
        this.acceleration = new PIXI.Point(0);
        console.log("ball created")
    }

    move(x, y) { //normalised vector
        this.x = x;
        this.y = y;
    }


}

var ballObjects = [];

function createBall() {
    const ball = new Ball(app);
    ballObjects.push(ball);
    app.stage.addChild(ball);
}

createBall();


function Update(delta) {
    for(let i = 0; i < ballObjects.length; i++) {
        ballObjects[i].velocity += Ball.gravity * delta * 0.05;
        direction = {x:0, y: 1};
        direction.x *= ballObjects[i].velocity;
        direction.y *= ballObjects[i].velocity;
        ballObjects[i].move(direction.x + ballObjects[i].x, direction.y + ballObjects[i].y);

    }
}



