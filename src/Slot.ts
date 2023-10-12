import { Timer } from "./Util";
import { R } from "./Resource";
import * as PIXI from 'pixi.js';

export namespace Slots {

    const Faces = [
        R.Images.Joker,
        R.Images.Clown,
        R.Images.Horse
    ]

    const Multipliers = [
        R.Images.Multi_1,
        R.Images.Multi_2,
        R.Images.Multi_3,
        R.Images.Multi_4,
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

        constructor(face: number, images: any) {
            let texture: PIXI.Texture = PIXI.Texture.from(images[face]);
            super(texture)
            this.face = face;
            this.anchor.set(0.5, 0.5)
            this.height = Tile.Size - Tile.Padding;
            this.width = Tile.Size - Tile.Padding;
        }

        static RandomFace(faceList: any){
            return(Math.floor(Math.random() * Object.keys(faceList).length))
        }
    }

    class Column extends PIXI.Sprite{
        private hiddenPadding: number = 1;
        private speed: number = 20;
        private stripLength: number = 3;
        
        private faceList: any;
        private currentSpeed: number = 20;
        private tileArray : Tile[];
        private currentTile: number = 0;
        private targetTiles: number = 50;
        private resultFaces: Face[] = [];

        private slotTicker!: PIXI.Ticker;

        private ctx: any;
        private callback: Function;

        constructor(ctx: any, callback: Function, facelist: any, length: number = 0, spinSpeed: number = 20) {
            super();
            this.ctx = ctx;
            this.callback = callback
            this.faceList = facelist;
            this.stripLength = length;
            this.speed = spinSpeed;

            this.tileArray = []
            let startPosition = (Tile.Size * this.hiddenPadding);
            for(let i = 0; i < this.stripLength + this.hiddenPadding; i++) {
                let tile =  new Tile(Tile.RandomFace(this.faceList), this.faceList);
                tile.y = startPosition - (Tile.Size * i);
                this.tileArray[i] = tile;
                this.addChild(tile);
            }
        }

        private GenerateTile(face: Face) {
            let tile =  new Tile(face, this.faceList);
            tile.y = this.tileArray[this.tileArray.length - 1].position.y - Tile.Size;
            return(tile);
        }

        private AddTile(tile: Tile) {
            this.tileArray[0].destroy();
            this.tileArray.shift();
            this.tileArray.push(tile);
            this.addChild(tile);
        }

        GetTileAt(index: number): Tile {
            return(this.tileArray[index - this.hiddenPadding]);
        }
        Spin(resultFaces: Face[] | undefined) {
            if (resultFaces != undefined) {
                this.resultFaces = [...resultFaces];
                for(let i = resultFaces.length; i < this.stripLength; i++) {
                    this.resultFaces[i] = Tile.RandomFace(this.faceList);
                }
            } else {
                for(let i = 0; i < this.stripLength; i++) {
                    this.resultFaces[i] = Tile.RandomFace(this.faceList);
                }
            }
            this.currentSpeed = this.speed;
            
            this.slotTicker = new PIXI.Ticker();
            this.slotTicker.autoStart = true;
            this.slotTicker.add((delta) => this.UpdateSpin(delta));

            return([...this.resultFaces]);
        }

        UpdateSpin(delta: number) {
            this.y += delta * this.currentSpeed;

            let relativePos = this.position.y;
            let tileElapsed = Math.floor((relativePos / Tile.Size));

            if (tileElapsed < (this.targetTiles - this.stripLength - this.hiddenPadding)) {
                for(let i = 0; i < tileElapsed - this.currentTile; i++) {
                    let tile =  this.GenerateTile(Tile.RandomFace(this.faceList));
                    this.AddTile(tile);
                }
            }
            else if (tileElapsed < this.targetTiles) {
                for(let i = 0; i < tileElapsed - this.currentTile; i++)  {
                    let face = this.resultFaces.shift();
                    if (face != undefined) {
                        let tile = (this.GenerateTile(face));
                        this.addChild(tile);
                        this.tileArray.push(tile);
                        this.addChild(tile);
                    }
                    else {
                        let tile = this.GenerateTile(Tile.RandomFace(this.faceList));
                        this.AddTile(tile);
                    }
                    while(this.tileArray.length > this.stripLength + this.hiddenPadding){
                        this.tileArray[0].destroy();
                        this.tileArray.shift();
                    }
                }
            }

            this.currentTile = tileElapsed;
            if(this.currentTile < this.targetTiles - 1) {
                this.currentSpeed = this.speed * (1.05 - (this.currentTile / this.targetTiles));
            }
            else {
                this.StopSpin();
            }            
        }

        async StopSpin(){            
            this.currentSpeed = 0;
            this.slotTicker.destroy();

            let startPosition = (Tile.Size * this.hiddenPadding);
            this.tileArray.forEach((tileSprite, index) => {
                tileSprite.y = startPosition - (Tile.Size * index);
            });
            this.position.y = 0;

            this.callback.call(this.ctx);
        }


        // NatualUpdateSpin(delta: number) {
        //     this.y += delta * this.currentSpeed;
            
        //     let relativePos = (this.position.y);
        //     let tileElapsed = Math.floor((relativePos / Tile.Size));

        //     if (tileElapsed > this.currentTile) {
        //         for(let i = 0; i < tileElapsed - this.currentTile; i++) {
        //             let tile =  this.GenerateTile(Tile.RandomFace())
        //             this.addChild(tile);
        //             this.tileArray.push(tile);
        //             this.tileArray[0].destroy();
        //             this.tileArray.shift();
        //         }
        //         this.currentTile = tileElapsed;
        //     }
        // }    

        // async NaturalStopSpin(freq: number){
        //     let totalTime = Slot.spinTime * 1000;
        //     while(this.elapsedTime < totalTime) {
        //         this.elapsedTime += freq;
        //         this.currentSpeed = this.speed *  (1 - (this.elapsedTime / totalTime));  
                
        //         await Timer.sleep(freq);
        //     }

        //     this.currentSpeed = 0;
        // }
    }

    export class BaseSlot extends PIXI.Sprite{
        public spinSpeed: number = 50;

        protected faceList: any = Faces;
        protected columns: number = 3;
        protected rows: number = 3;
        protected cascadeDelay: number = 150;   
        protected currentSpinning: number = 0;     

        protected slots: Column[] = [];
        protected faces: Face[][] = [];

        constructor() {
            super();
            this.anchor.set(0.5);
        }


        async Spin() {
            for(let i = 0; i < this.columns; i++) {
                this.faces[i] = this.slots[i].Spin(this.faces[i]);
                
                await Timer.sleep(this.cascadeDelay);
            }
            this.currentSpinning = this.columns;
        }

        CreateSlots() {
            let slotContainer = new PIXI.Sprite();
            slotContainer.scale.set(2.11);
            this.GenerateColumn(slotContainer);
            this.addChild(slotContainer);
        }

        CreateFrame() {
            let texture: PIXI.Texture = PIXI.Texture.from(R.Images.SlotFrame);
            let frame = new PIXI.Sprite(texture);
            frame.anchor.set(0.5, 0.5);
            frame.position.set(0,0);
            frame.zIndex++;
            this.addChild(frame);
        }

        private GenerateColumn(container:PIXI.Sprite) {
            let startX = -(Tile.Size * this.columns/2);
            for(let i = 0; i < this.columns; i++) {
                const column = new Column(this, this.onSlotDone, this.faceList, this.rows, this.spinSpeed);
                column.position.x = startX + (Tile.Size/2) + (Tile.Size * i);
                container.addChild(column);
                this.slots.push(column);
            }
        }

        private onSlotDone() {
            this.currentSpinning -= 1;
            if(this.currentSpinning <= 0) {
                this.onSpinDone();
            }
        }
        
        protected onSpinDone() {}
    }

    export class Slot extends BaseSlot{
        //public static spinTime: number = 5;
        public rowReward: number = 0;

        protected columns: number = 3;
        public multiplier: number = 1;
        
        
        private multiSlot: BaseSlot;
        private callback: Function;

        constructor(callback: Function) {
            super();
            this.callback = callback;

            this.CreateSlots()

            this.CreateFrame();
            this.sortChildren();
            this.multiSlot = new MultiplierSlot(this);
            this.multiSlot.zIndex ++

            this.addChild(this.multiSlot);
            this.multiSlot.x += 530;
        }


        async Spin() {
            for(let i = 0; i < this.columns; i++) {
                this.faces[i] = this.slots[i].Spin(this.faces[i]);
                
                await Timer.sleep(this.cascadeDelay);
            }
            this.currentSpinning = this.columns + 1;

            this.multiSlot.Spin()
        }

        protected onSpinDone() {
            let rewards: ResultData = this.CalculateMatches();
            rewards.Multiplier = this.multiplier;
            let total: number = 0;
            for(let i = 0; i < rewards.Rewards.length; i ++) {
                total += rewards.Rewards[i] * rewards.Multiplier;
            }
            rewards.Total = total;
            this.callback.call(this, rewards);
        }

        private CalculateMatches(): ResultData {
            let tileArray: ResultData = {
                Matches: [],
                Rewards: [],
                Multiplier: 0,
                Total: 0
            };

            let tilesPos: number[][][] = [];
            let faces: Face[][] = [];

            for(let corner = 0; corner < this.rows + 1; corner += (this.rows - 1)) {
                let pos: number[][] = [];
                let face: Face[] = [];

                for(let row = 0; row < this.rows; row++) {
                    pos.push([row, Math.abs(corner - row)]);
                    face.push( this.faces[row][Math.abs(corner - row)]);
                }

                tilesPos.push(pos);
                faces.push(face);
            }

            for(let row = 0; row < this.rows; row++) {
                let pos: number[][] = [[0, row]];
                let face: Face[] = [this.faces[0][row]];

                for(let col = 1; col < this.columns; col++) {
                    pos.push([col, row]);
                    face.push( this.faces[col][row]);
                }

                tilesPos.push(pos);
                faces.push(face);
            }

            faces.forEach((face, index) => {
                let jokerMatch : boolean = false;
                if (face.every((value) => value === 0)) {
                        tileArray.Matches.push(tilesPos[index]);
                        tileArray.Rewards.push(Score[Face.JOKER]);
                    } else {
                        const matchingFace = face.find((item) => item !== 0);
                        const rowMatched = face.every((value, index, arr) => value === Face.JOKER || value === arr.find((item) => item !== Face.JOKER));
                        if (rowMatched && matchingFace != undefined) {
                            tileArray.Matches.push(tilesPos[index]);
                            tileArray.Rewards.push(Score[matchingFace]);
                        }
                        
                    }
                }
            )
            
            return(tileArray);
        }
    }

    class MultiplierSlot extends BaseSlot{
        protected columns: number = 1
        protected rows: number = 3
        protected faceList: any = Multipliers;

        private ctx: any;

        constructor(ctx: any) {
            super()
            this.ctx = ctx;
            this.CreateSlots()
            this.CreateFrame();
            this.sortChildren();
        }

        CreateFrame() {
            let texture: PIXI.Texture = PIXI.Texture.from(R.Images.SlotFrame);
            let frame = new PIXI.Sprite(texture);
            frame.scale.set(0.33, 1)
            frame.anchor.set(0.5, 0.5);
            frame.position.set(0,0);
            frame.zIndex++;

            this.addChild(frame);

            let arrowTexture: PIXI.Texture = PIXI.Texture.from(R.Images.SlotArrow);
            let arrow = new PIXI.Sprite(arrowTexture);
            arrow.anchor.set(0.5);
            arrow.position.set(-100,0);
            arrow.scale.set(0.1)
            arrow.zIndex++;

            this.addChild(arrow);
        }

        protected onSpinDone() {
            this.ctx.multiplier = this.faces[0][1] + 1
            this.ctx.onSpinDone()
        }

        
    }

    export interface ResultData{
        Matches: number[][][];
        Rewards: number[];
        Multiplier: number;
        Total: number;
    }
}