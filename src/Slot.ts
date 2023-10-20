import { Timer } from "./Util";
import { R } from "./Resource";
import * as PIXI from 'pixi.js';

const amounts: number[] = [50, 100, 250, 500, 1500, 2500, 5000];
export namespace Slots {

    const Faces = [
        R.Images.Joker,
        R.Images.RedClown,
        R.Images.BlueClown,
        R.Images.GreenClown,
        R.Images.Elephant,
        R.Images.Tiger,
        R.Images.Horse,
        R.Images.Monkey,
    ]

    const Multipliers = [
        R.Images.Multi_1,
        R.Images.Multi_2,
        R.Images.Multi_3,
        R.Images.Multi_5,
        R.Images.Multi_10,
        R.Images.Multi_15,
    ]

    const TurboMultipliers = [
        R.Images.Multi_T2,
        R.Images.Multi_T3,
        R.Images.Multi_T5,
        R.Images.Multi_T10,
        R.Images.Multi_T15,
    ]

    const MultiplyValue: number[] = [
        1,
        2,
        3,
        5,
        10,
        15,
    ]

    enum Face {
        JOKER = 0,
        REDCLOWN = 1,
        BLUECLOWN = 2,
        GREENCLOWN = 3,
        ELEPHANT = 4,
        TIGER = 5,
        HORSE = 6,
        MONKEY = 7
        
    }

    const Score: number[] = [
        250,
        200,
        150,
        100,
        50,
        20,
        8,
        4
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
            //code logic
        
            Math.floor(Math.random() * Object.keys(faceList).length)
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
        public targetTiles: number = 40;
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
                this.currentSpeed = this.speed * (1.1 - (this.currentTile / this.targetTiles));
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

        public CallBack(ResultData: ResultData) {}


        async Spin() {
            for(let i = 0; i < this.columns; i++) {
                this.faces[i] = this.slots[i].Spin(this.faces[i]);
                
                await Timer.sleep(this.cascadeDelay);
            }
            this.currentSpinning = this.columns;
        }

        protected CreateSlots() {
            let slotContainer = new PIXI.Sprite();
            slotContainer.scale.set(2.11);
            this.GenerateColumn(slotContainer);
            this.addChild(slotContainer);
        }

        protected CreateFrame() {
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
        
        protected onSpinDone() {
            this.faces = []
        }
    }

    export class Slot extends BaseSlot{
        //public static spinTime: number = 5;
        public betAmount: number = 50;

        protected columns: number = 3;
        public multiplier: number = 1;

        protected faces: Face[][] = [
        ];
        
        private multiSlot: MultiplierSlot;

        constructor() {
            super();

        
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
                this.slots[i].targetTiles = this.slots[0].targetTiles * (1 + (i * 0.15))
                this.faces[i] = this.slots[i].Spin(this.faces[i]);
                
                //await Timer.sleep(this.cascadeDelay);
            }

            this.currentSpinning = this.columns + 1;

            this.multiSlot.Spin()
        }

        public SetTurbo(bool: Boolean) {
            this.multiSlot.SetTurbo(bool);
        }


        protected onSpinDone(){
            let rewards: ResultData = this.CalculateMatches();
            rewards.Multiplier = this.multiplier;
            let total: number = 0;
            for(let i = 0; i < rewards.Rewards.length; i ++) {
                total += rewards.Rewards[i] * rewards.Multiplier;
            }
            rewards.Total = total;

            super.onSpinDone()
        
            this.CallBack(rewards)
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
                if (face.every((value) => value === Face.JOKER)) {
                        tileArray.Matches.push(tilesPos[index]);
                        tileArray.Rewards.push(Score[Face.JOKER] * this.betAmount / 5 );
                    } else {
                        const matchingFace = face.find((item) => item !== Face.JOKER); //find non joker
                        const rowMatched = face.every((value, index, arr) => value === Face.JOKER || value === arr.find((item) => item !== Face.JOKER));
                        if (rowMatched && matchingFace != undefined) {
                            tileArray.Matches.push(tilesPos[index]);
                            tileArray.Rewards.push(Score[matchingFace] * this.betAmount / 5);
                        }
                        
                    }
                }
            )
            
            return(tileArray);
        }
    }

    class MultiplierSlot extends BaseSlot{
        protected columns: number = 1
        protected faceList: any = Multipliers;

        protected faces: Face[][] = [];

        private turbo: Boolean = false;
        private ctx: any;

        constructor(ctx: any) {
            super()
            this.ctx = ctx;
            this.CreateSlots();
            this.CreateFrame();
            this.sortChildren();
        }

        public SetTurbo(bool: Boolean) {
            if (bool) {
                this.turbo = bool;
                this.faceList = TurboMultipliers;
            } else {
                this.turbo = bool;
                this.faceList = Multipliers;
            }

            this.slots.forEach(element => {
                element.destroy();
            });
            this.slots = [];
            this.CreateSlots()
            this.sortChildren();
            
        }

        protected CreateFrame() {
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
            if (this.turbo) {
                this.ctx.multiplier = MultiplyValue[this.faces[0][1] + 1]
            } else {
                this.ctx.multiplier = MultiplyValue[this.faces[0][1]];
            }
            this.ctx.onSpinDone();
            super.onSpinDone();
        }
        
    }

    export interface ResultData{
        Matches: number[][][];
        Rewards: number[];
        Multiplier: number;
        Total: number;
    }
}

export class SlotUI extends PIXI.Sprite{
    
    private betAmount: number = 50;
    private amount: number = 50000;
    private amountInterval: number = 0; //index
    private turbo: boolean = false;

    private amountText!: PIXI.Text;
    private betText!: PIXI.Text;
    private rewardPrompt: PIXI.Text;
    private spinButton: PIXI.Sprite;
    private amountContainer: PIXI.Sprite;
    private turboToggle: PIXI.Sprite;
    private turboMultipy: number = 1;

    constructor() {
        super()
        this.anchor.set(0.5);


        this.rewardPrompt = this.CreateRewardPrompt();
        this.addChild(this.rewardPrompt)

        this.amountContainer = this.CreateAmount();
        this.addChild(this.amountContainer)

        this.spinButton = this.CreateSpinButton()
        this.addChild(this.spinButton);

        this.turboToggle = this.CreateTurboSwitch()
        this.addChild(this.turboToggle);

        this.addChild(this.CreateAmountUI());
        
        this.updateBet(this.amountInterval)
    }

    public Deduct() {
        this.amount -= this.betAmount;
        this.amountText.text =  this.amount;
    }

    public ButtonCallBack() {}

    public OnBetChanged(amount: number) {}

    public OnTurboToggle(bool: Boolean) {}

    private CreateAmountUI(): PIXI.Sprite {
        const betContainer: PIXI.Sprite = new PIXI.Sprite();
        betContainer.anchor.set(0.5);
        betContainer.x += 400
        betContainer.scale.set(0.1);

        const decrementButton: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.from(R.Images.MinusIcon));
        decrementButton.anchor.set(0.5);
        decrementButton.eventMode = 'static';
        decrementButton.x -= 1500;
        decrementButton.on('click', () => {
            this.updateBet(-1)
        })
        betContainer.addChild(decrementButton);

        const betText = new PIXI.Text('50', {
            fontFamily:"Verdana",
            fontSize:500,
            fontVariant:"small-caps",
            fontWeight:"bold"
        })
        betText.anchor.set(0.5);
        this.betText = betText
        betContainer.addChild(betText);

        const incrementButton: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.from(R.Images.PlusIcon));
        incrementButton.anchor.set(0.5);
        incrementButton.x += 1500;
        incrementButton.eventMode = 'static';
        incrementButton.on('click', () => {
            this.updateBet(1)
        })
        betContainer.addChild(incrementButton);

        return(betContainer)
    }

    private CreateSpinButton(): PIXI.Sprite{
        const spinButton:PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.from(R.Images.SpinButton));
        spinButton.scale.set(0.3)
        spinButton.anchor.set(0.5);
        spinButton.eventMode = 'static';
        spinButton.on('click', () => {
            this.ButtonCallBack();
        })
        return(spinButton);
    }

    private CreateTurboSwitch(): PIXI.Sprite {

        const textureOff = PIXI.Texture.from(R.Images.ToggleOff);
        const textureOn = PIXI.Texture.from(R.Images.ToggleOn)

        const turboToggle:PIXI.Sprite = new PIXI.Sprite(textureOff);
        turboToggle.scale.set(0.2);
        turboToggle.anchor.set(0.5);
        turboToggle.x -= 200;
        turboToggle.eventMode = 'static';
        turboToggle.on('click', () => {
            console.log("turbo")
            if(this.turbo){
                turboToggle.texture = textureOff;
                this.turboMultipy = 1;
                this.turbo = false;
            } else {
                turboToggle.texture = textureOn;
                this.turboMultipy = 1.5;
                this.turbo = true;
            }
            this.updateBet(0)
            this.OnTurboToggle(this.turbo);
        })
        return(turboToggle);
    }

    private CreateRewardPrompt(): PIXI.Text {
        const rewardText = new PIXI.Text("", {
            fontFamily:"Verdana",
            fontSize:100,
            fontVariant:"small-caps",
            fontWeight:"bold"
        });
        rewardText.visible = false;
        rewardText.y -= 200;
        rewardText.anchor.set(0.5);

        return(rewardText);
    }

    private CreateAmount() {
        const amountContainer: PIXI.Sprite = new PIXI.Sprite();
        amountContainer.anchor.set(0.5);
        amountContainer.x -= 450;
        amountContainer.scale.set(0.1);

        const amountText = new PIXI.Text(this.amount, {
            fontFamily:"Verdana",
            fontSize:500,
            fontVariant:"small-caps",
            fontWeight:"bold"
        });
        amountText.anchor.set(0.5);
        this.amountText = amountText;
        amountContainer.addChild(amountText);

        return(amountContainer)
    }

    private updateBet(change: number) {
        this.amountInterval += change

        if (this.amountInterval > amounts.length - 1) {
            this.amountInterval = amounts.length - 1;
        } else if (this.amountInterval < 0) {
            this.amountInterval = 0;
        }

        this.betAmount = amounts[this.amountInterval] * this.turboMultipy;
        this.betText.text = this.betAmount;
        this.OnBetChanged(this.betAmount)
    }

    async ShowReward(result: Slots.ResultData) {
        this.rewardPrompt.text = R.String.Win + result.Total;
        this.rewardPrompt.visible = true;
        this.amount += result.Total;
        this.amountText.text =  this.amount;

        await Timer.sleep(4000);

        this.rewardPrompt.visible = false
    }
}
