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
        `${path}/joker.png`,
        `${path}/clown.jpeg`,
        `${path}/horse.jpg`
    ]

    enum Face {
        JOKER = 0,
        REDCLOWN = 1,
        HORSE = 2,
    }

    const Score: number[] = [
        1000,
        500,
        200
    ]

    class Tile extends PIXI.Sprite{
        static Size = 80;
        static Padding = 5;

        face: number;

        constructor(face: number) {
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
        private hiddenPadding: number = 2;
        private speed: number = 20;
        private stripLength: number = 3;
        

        private currentSpeed: number = 20;
        private elapsedTime: number = 0;
        private tileArray : Tile[];
        private currentTile: number = 0;
        private targetTiles: number = 50;
        private resultFaces: Face[] = [];

        private slotTicker!: PIXI.Ticker;

        public ctx: Slot;

        constructor(slot: Slot, length: number = 0, spinSpeed: number = 20) {
            super();
            this.ctx = slot;
            this.stripLength = length;
            this.speed = spinSpeed;

            this.tileArray = []
            for(let i = 0; i < this.stripLength + this.hiddenPadding; i++) {
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

        GetTileAt(index: number): Tile {
            return(this.tileArray[index - this.hiddenPadding])
        }
        Spin(resultFaces: Face[] | undefined) {
            if (resultFaces != undefined) {
                this.resultFaces = [...resultFaces];
                for(let i = resultFaces.length; i < this.stripLength; i++) {
                    this.resultFaces[i] = Tile.RandomFace();
                }
            } else {
                for(let i = 0; i < this.stripLength; i++) {
                    this.resultFaces[i] = Tile.RandomFace();
                }
            }
            this.currentSpeed = this.speed;
            this.elapsedTime = 0;
            
            this.slotTicker = new PIXI.Ticker();
            this.slotTicker.autoStart = true;
            this.slotTicker.add((delta) => this.UpdateSpin(delta));

            return(this.resultFaces)
        }

        UpdateSpin(delta: number) {
            this.y += delta * this.currentSpeed

            let relativePos = this.position.y
            let tileElapsed = Math.floor((relativePos / Tile.Size));

            if (tileElapsed < (this.targetTiles - this.stripLength - 2 )) {
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
                    while(this.tileArray.length > this.stripLength + this.hiddenPadding){
                        this.tileArray[0].destroy();
                        this.tileArray.shift()
                    }
                }
            }

            this.currentTile = tileElapsed;
            if(this.currentTile < this.targetTiles - this.hiddenPadding) {
                this.currentSpeed = this.speed * (1.1 - (this.currentTile / this.targetTiles));
            }
            else {
                this.StopSpin();
            }            
        }

        async StopSpin(){            
            this.currentSpeed = 0;
            this.slotTicker.destroy();
            this.position.y -= this.position.y % Tile.Size;

            this.tileArray.forEach(element => {
                element.y += this.position.y
            });
            this.position.y = 0;

            this.ctx.currentSpinning--;
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
        private columns: number = 3;
        private rows: number = 3;
        private gap: number = 5;
        private cascadeDelay: number = 150;

        public spinTime: number = 5;
        public spinSpeed: number = 50;
        public currentSpinning: number = 0;

        private slots: Column[] = [];

        private faces: Face[][] = []

        constructor() {
            let texture: PIXI.Texture = Texture.from(`${path}/slot.png`);
            super(texture);
            this.scale.set(0.5,0.5);

            this.eventMode = 'static';
            this.GenerateColumn();

            this.on('click', () => {
                slot.Spin();
            })
            this.anchor.set(0.5, 0);
            this.x = app.screen.width/2;
            this.y = (app.screen.height/2) + (this.rows * Tile.Size / 2);
            
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
            for(let i = 0; i < this.columns; i++) {
                this.currentSpinning = 9;

                this.faces[i] = this.slots[i].Spin(this.faces[i]);
                
                await Timer.sleep(this.cascadeDelay);
            }
            let rewards: ResultData = this.CalculateScore();
            console.log(rewards.Matches, rewards.Rewards)

            let spinCheck: PIXI.Ticker = new PIXI.Ticker();
            spinCheck.speed = 0.5;
            spinCheck.add((delta) => this.SpinCheck(delta, spinCheck));
            spinCheck.start();

        }

        SpinCheck(delta:number, spinCheck: PIXI.Ticker){
            if(this.currentSpinning == 0) {
                //do code after done
                console.log("spin Finished")
                spinCheck.destroy;
            }
        }

        CalculateScore(): ResultData {
            let tileArray: ResultData = {
                Matches: [],
                Rewards: []
            }

            let tilesPos: number[][][] = [];
            let faces: Face[][] = [];

            for(let corner = 0; corner < this.rows + 1; corner += (this.rows - 1)) {
                let pos: number[][] = [];
                let face: Face[] = [];

                for(let row = 0; row < this.rows; row++) {
                    pos.push([row, Math.abs(corner - row)]);
                    face.push( this.faces[row][Math.abs(corner - row)])
                }

                tilesPos.push(pos)
                faces.push(face)
            }

            for(let row = 0; row < this.rows; row++) {
                let jokerMatch : boolean = false
                let pos: number[][] = [[0, row]];
                let face: Face[] = [this.faces[0][row]];

                for(let col = 1; col < this.columns; col++) {
                    pos.push([col, row]);
                    face.push( this.faces[col][row])
                }

                tilesPos.push(pos)
                faces.push(face)
            }

            faces.forEach((face, index) => {
                let jokerMatch : boolean = false
                if (face.every((value) => value === 0)) {
                        jokerMatch = true;
                        console.log("JOKER MATCH");
                        tileArray.Matches.push(tilesPos[index])
                        tileArray.Rewards.push(Score[Face.JOKER])
                    } else {
                        const matchingFace = face.find((item) => item !== 0);
                        const rowMatched = face.every((value, index, arr) => value === Face.JOKER || value === arr.find((item) => item !== Face.JOKER));
                        if (rowMatched && matchingFace != undefined) {
                            tileArray.Matches.push(tilesPos[index])
                            tileArray.Rewards.push(Score[matchingFace])
                        }
                        
                    }
                }
            )
            
            return(tileArray);
        }
    }
    interface ResultData{
        Matches: number[][][];
        Rewards: number[]
    }
}

document.getElementById('pixi-container')?.appendChild(app.view);

const slot = new Slots.Slot();
app.stage.addChild(slot);



