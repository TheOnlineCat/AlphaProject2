import { Config } from "./config";
import * as PIXI from 'pixi.js';


const Application = PIXI.Application;
const Renderer = PIXI.Renderer;
const Graphics = PIXI.Graphics;
const app = new Application<HTMLCanvasElement>({ resizeTo: window });
app.renderer.background.color = 0x23395D;
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = "absolute";
app.ticker.autoStart = false

document.body.appendChild(app.view);

let mouseCoords = {x: 0, y: 0};

// const mouseMove = ((event:	PIXI.FederatedPointerEvent) =>
// {
//     mouseCoords.x = event.global.x;
//     mouseCoords.y = event.global.y;
// });


export function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export namespace Slot {
    const Texture = PIXI.Texture;
    const path = Config.images;

    const Resources = [
        `${path}/joker.jpg`,
    ]

    enum Face
    {
        JOKER = 0,
        REDCLOWN = 1,

    }
    class Tile extends PIXI.Sprite{
        static Size = 80;

        constructor(face: Face) {
            let texture: PIXI.Texture = Texture.from(Resources[face]);
            super(texture)
            this.height = Tile.Size;
            this.width = Tile.Size;
        }
    }
    class Column extends PIXI.Sprite{
        stripLength: number = 5;
        speed: number = 20;

        tileArray : PIXI.Sprite[];
        currentTile = 0;

        constructor(length: number = 0, spinSpeed: number = 20) {
            super();
            this.stripLength = length + 2;
            this.speed = spinSpeed;

            this.tileArray = []
            for(let i = 0; i < this.stripLength; i++) {
                let tile =  new Tile(Face.JOKER);
                tile.y = Tile.Size * -i;
                this.tileArray[i] = tile;
                this.addChild(tile);
            }
            this.anchor.set(0.5);
            this.x = app.screen.width/2;
            this.y = app.screen.height/2;
        }

        Spin(delta: number) {
            this.y += delta * this.speed
            
            let relativePos = (this.position.y - (app.screen.height/2))
            let tileElapsed = Math.floor((relativePos / Tile.Size));

            if (tileElapsed > this.currentTile) {
                for(let i = 0; i < tileElapsed - this.currentTile; i++) {
                    let tile =  new Tile(Face.JOKER);
                    tile.y = this.tileArray[this.stripLength-1].position.y - Tile.Size;
                    this.addChild(tile)
                    this.tileArray.push(tile)
                    this.tileArray[0].destroy();
                    this.tileArray.shift()
                }
                this.currentTile = tileElapsed;
            }
        }
    }

    export class Slots extends PIXI.Sprite{
        columns: number = 7;
        rows: number = 5
        gap: number = 5;
        spinSpeed: number = 10
        cascadeDelay: number = 150;

        elapsedTime = 0;

        slots: Column[] = []

        constructor() {
            super()
            let positionX = (Tile.Size + this.gap);
            let startX = app.screen.width/2 - (positionX * this.columns/2)

            for(let i = 0; i < this.columns; i++) {
                const column = new Column(this.rows, this.spinSpeed);
                column.position.x = startX + (positionX * i);
                this.addChild(column);
                this.slots.push(column);
            }
            
        }


        async Spin() {
            app.ticker.start();
            for(let i = 0; i < this.columns; i++) {
                await sleep(this.cascadeDelay);
                app.ticker.add((delta) => this.slots[i].Spin(delta));
            }
        }

    }
}

document.getElementById('pixi-container')?.appendChild(app.view);

const slot = new Slot.Slots();
slot.eventMode = 'static';
app.stage.addChild(slot);
app.renderer.render(app.stage);

console.log("Started Successfully" + Math.random())

slot.on('click', () => {
    // Your click event handler logic here
    console.log('Sprite clicked!');
    slot.Spin();
})

