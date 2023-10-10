import { Config } from "./config";
import * as PIXI from 'pixi.js';


const Application = PIXI.Application;
const Renderer = PIXI.Renderer;
const Graphics = PIXI.Graphics;
const app = new Application<HTMLCanvasElement>({ resizeTo: window });
app.renderer.background.color = 0x23395D;
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = "absolute";
app.ticker.autoStart = true;

document.body.appendChild(app.view);

let mouseCoords = {x: 0, y: 0};

// const mouseMove = ((event:	PIXI.FederatedPointerEvent) =>
// {
//     mouseCoords.x = event.global.x;
//     mouseCoords.y = event.global.y;
// });


export class Timer{
    static sleep(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}

export namespace Slots {
    const Texture = PIXI.Texture;
    const path = Config.images;

    const Resources = [
        `${path}/joker.jpg`,
        `${path}/clown.jpeg`
    ]

    enum Face
    {
        JOKER = 0,
        REDCLOWN = 1,
    }
    class Tile extends PIXI.Sprite{
        static Size = 80;
        static Padding = 5;

        face: number;

        constructor(face: Face) {
            let texture: PIXI.Texture = Texture.from(Resources[face]);
            super(texture)
            this.face = face;
            this.height = Tile.Size - Tile.Padding;
            this.width = Tile.Size - Tile.Padding;
        }

        static RandomFace(){
            return(Math.floor(Math.random() * Object.keys(Face).length / 2))
        }
    }
    class Column extends PIXI.Sprite{
        private seed = Math.random();
        private stripLength: number = 5;
        private speed: number = 20;

        private currentSpeed: number = 20;
        private elapsedTime: number = 0;
        private tileArray : PIXI.Sprite[];
        private currentTile: number = 0;
        private targetTiles: number = 50;
        private resultFaces: Face[] = [];

        private slotTicker!: PIXI.Ticker;

        public ctx: Slot;

        constructor(slot: Slot, length: number = 0, spinSpeed: number = 20) {
            super();
            this.ctx = slot;
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
            
        }

        private GenerateTile(face: Face) {
            let tile =  new Tile(face);
            tile.y = this.tileArray[this.tileArray.length - 1].position.y - Tile.Size;
            return(tile)
        }

        private AddTile(tile: Tile) {
            this.tileArray[0].destroy();
            this.tileArray.shift()
            this.tileArray.push(tile)
            this.addChild(tile)
        }

        Spin(resultFaces: Face[]) {
            this.resultFaces = [...resultFaces];
            this.currentSpeed = this.speed;
            this.elapsedTime = 0;
            //this.currentTile = 0;
            console.log("spinning")
            this.slotTicker = new PIXI.Ticker();
            this.slotTicker.autoStart = true;
            this.slotTicker.add((delta) => this.UpdateSpin(delta));
            //this.StopSpin(200);
        }

        UpdateSpin(delta: number) {
            this.y += delta * this.currentSpeed

            let relativePos = this.position.y
            let tileElapsed = Math.floor((relativePos / Tile.Size));

            if (tileElapsed < (this.targetTiles - this.stripLength + 1)) {
                for(let i = 0; i < tileElapsed - this.currentTile; i++) {
                    let tile =  this.GenerateTile(Tile.RandomFace())
                    this.AddTile(tile)
                }
            }
            else if (tileElapsed < this.targetTiles) {
                for(let i = 0; i < tileElapsed - this.currentTile; i++)  {
                    let face = this.resultFaces.shift();
                    if (face != undefined) {
                        let tile = (this.GenerateTile(face))
                        this.addChild(tile)
                        this.tileArray.push(tile)
                        this.addChild(tile)
                    }
                    else {
                        let tile = this.GenerateTile(Tile.RandomFace())
                        this.AddTile(tile)
                    }
                    while(this.tileArray.length > this.stripLength){
                        this.tileArray[0].destroy();
                        this.tileArray.shift()
                    }
                }
            }

            this.currentTile = tileElapsed;
            if(this.currentTile < this.targetTiles ) {
                this.currentSpeed = this.speed * (1.1 - (this.currentTile / this.targetTiles));
            }
            else {
                this.StopSpin();
            }            
        }

        async StopSpin(){            
            await Timer.sleep(500);
            this.targetTiles += this.targetTiles;
            this.currentSpeed = 0;
            this.slotTicker.destroy();
        }


        NatualUpdateSpin(delta: number) {
            this.y += delta * this.currentSpeed
            
            let relativePos = (this.position.y - (app.screen.height/2))
            let tileElapsed = Math.floor((relativePos / Tile.Size));

            if (tileElapsed > this.currentTile) {
                for(let i = 0; i < tileElapsed - this.currentTile; i++) {
                    let tile =  this.GenerateTile(Tile.RandomFace())
                    this.addChild(tile)
                    this.tileArray.push(tile)
                    this.tileArray[0].destroy();
                    this.tileArray.shift()
                }
                this.currentTile = tileElapsed;
            }
        }    

        async NaturalStopSpin(freq: number){
            let totalTime = this.ctx.SpinTime * 1000;
            while(this.elapsedTime < totalTime) {
                this.elapsedTime += freq;
                this.currentSpeed = this.speed *  (1 - (this.elapsedTime / totalTime));  
                
                await Timer.sleep(freq);
            }

            this.currentSpeed = 0;
        }

        
    }

    export class Slot extends PIXI.Sprite{
        private columns: number = 5;
        private rows: number = 3
        private gap: number = 5;
        private cascadeDelay: number = 150;

        public spinTime: number = 5;
        public spinSpeed: number = 50;

        private slots: Column[] = [];

        constructor() {
            super();
            this.eventMode = 'static';
            this.GenerateColumn();

            this.on('click', () => {
                slot.Spin();
            })
            this.anchor.set(0.5);
            this.x = app.screen.width/2;
            this.y = app.screen.height/2;
        }

        public get SpinTime() {
            return(this.spinTime)
        }

        private GenerateColumn() {
            let positionX = (Tile.Size + this.gap);
            let startX = 0 - (positionX * this.columns/2)
            for(let i = 0; i < this.columns; i++) {
                const column = new Column(this, this.rows, this.spinSpeed);
                column.position.x = startX + (positionX * i);
                this.addChild(column);
                this.slots.push(column);
            }
        }


        async Spin() {

            let faces: Face[] = [Face.JOKER, Face.JOKER, Face.JOKER]

            for(let i = 0; i < this.columns; i++) {
                this.slots[i].Spin(faces);
                await Timer.sleep(this.cascadeDelay);
            }
        }
    }
}

document.getElementById('pixi-container')?.appendChild(app.view);

const slot = new Slots.Slot();
app.stage.addChild(slot);


