import { Draw, Timer } from "./Util";
import { R } from "./Resource";
import * as PIXI from 'pixi.js';
import { drawStar } from "@pixi/graphics-extras/lib/drawStar";
import { Sound, sound } from '@pixi/sound';


const amounts: number[] = [50, 100, 250, 500, 1500, 2500, 5000];
export namespace Slots {

    const Faces = [
        R.Images.Wild,
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

    const EXMultipliers = [
        R.Images.Multi_EX2,
        R.Images.Multi_EX3,
        R.Images.Multi_EX5,
        R.Images.Multi_EX10,
        R.Images.Multi_EX15,
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

    class Tile extends PIXI.Container{
        static Size = 80;
        static Padding = 0;
        static InnerPadding = 10;
    
        face?: number;
        images: any;
    
        constructor(face: number, images: any) {
            super();
            this.face = face;
            this.images = this.images
        }
    
        static async create(face: number, images: any) {
            let tile = new Tile(face, images);
            let backgroundSprite = new PIXI.Sprite();
            backgroundSprite.anchor.set(0.5, 0.5);
            backgroundSprite.height = Tile.Size - Tile.Padding;
            backgroundSprite.width = Tile.Size - Tile.Padding;
    
            let texture: PIXI.Texture = await PIXI.Assets.load(images[face]);
            let tileSprite = new PIXI.Sprite(texture);
            tileSprite.anchor.set(0.5, 0.5);
            tileSprite.height = backgroundSprite.height - Tile.InnerPadding;
            tileSprite.width = backgroundSprite.width - Tile.InnerPadding;
    
            tile.addChild(backgroundSprite);
            tile.addChild(tileSprite);
            tile.height = backgroundSprite.height;
            tile.width = backgroundSprite.width ;
            return tile;
        }
    
        static RandomFace(faceList: any){
            Math.floor(Math.random() * Object.keys(faceList).length)
            return(Math.floor(Math.random() * Object.keys(faceList).length))
        }

        static WeightedFace(faceList: any){
            Math.floor(Math.random() * Object.keys(faceList).length)
            return(Math.floor(Math.random() /*    * graph function   */ * Object.keys(faceList).length))
        }
    }

    class Column extends PIXI.Container{
        private hiddenPadding: number = 1;
        private speed: number = 20;
        private stripLength: number = 3;
        
        private faceList: any;
        private currentSpeed: number = 20;
        private tileArray : Tile[] = [];
        private currentTile: number = 0;
        private targetTiles: number = 40;
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
        }

        public static async create(ctx: any, callback: Function, facelist: any, length: number = 0, spinSpeed: number = 20) {
            const instance = new Column(ctx, callback, facelist, length, spinSpeed)

            let startPosition = (Tile.Size * instance.hiddenPadding);
            for(let i = 0; i < instance.stripLength + instance.hiddenPadding; i++) {
                let tile = await Tile.create(Tile.RandomFace(instance.faceList), instance.faceList);
                tile.y = startPosition - (Tile.Size * i);
                instance.tileArray[i] = tile;
                instance.addChild(tile);
            }

            instance.slotTicker = new PIXI.Ticker();
            instance.slotTicker.autoStart = false;
            instance.slotTicker.add((delta) => instance.UpdateSpin(delta));

            return instance;
        }

        public setSpeed(speed: number) {
            this.speed = speed;
        }
        
        public setTargetTiles(tiles: number) {
            this.targetTiles = tiles;
        }

        public getCurrentTiles() {
            return this.currentTile
        }
        

        private async GenerateTile(face: Face) {
            let tile = await Tile.create(face, this.faceList);
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
                this.resultFaces = resultFaces.slice();
                for(let i = resultFaces.length; i < this.stripLength; i++) {
                    this.resultFaces[i] = Tile.RandomFace(this.faceList);
                }
            } else {
                for(let i = 0; i < this.stripLength; i++) {
                    this.resultFaces[i] = Tile.RandomFace(this.faceList);
                }
            }
            this.currentSpeed = this.speed;
            
            
            this.slotTicker.start()

            return([...this.resultFaces]);
        }

        async UpdateSpin(delta: number) {
            this.y += delta * this.currentSpeed;

            let tileElapsed = Math.floor((this.position.y / Tile.Size));

            if (tileElapsed < (this.targetTiles - this.stripLength - this.hiddenPadding)) {
                for(let i = 0; i < tileElapsed - this.currentTile; i++) {
                    const tile = this.GenerateTile(Tile.RandomFace(this.faceList));
                    tile.then( (tile) => {
                        this.AddTile(tile);
                    })
                }
            }
            else if (tileElapsed < this.targetTiles) {
                for(let i = 0; i < tileElapsed - this.currentTile; i++)  {
                    const face = this.resultFaces.shift();
                    if (face != undefined) {
                        const tile = (this.GenerateTile(face));
                        tile.then((tile) => {
                            this.addChild(tile);
                            this.tileArray.push(tile);
                            this.addChild(tile);
                        })
                    }
                    else {
                        const tile = this.GenerateTile(Tile.RandomFace(this.faceList));
                        tile.then( (tile) => {
                            this.AddTile(tile);
                        })
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
            let wildFlag = false;
            
            this.currentSpeed = 0;
            this.slotTicker.stop()

            let startPosition = (Tile.Size * (this.hiddenPadding + 1));
            this.tileArray.forEach((tileSprite, index) => {
                tileSprite.y = startPosition - (Tile.Size * index);
                if (tileSprite.face == Face.JOKER && index != 0 && this.faceList != Multipliers) {
                    wildFlag = true;
                }
            });
            this.position.y = 0;

            this.callback.call(this.ctx);

            playSound(R.Sounds.ReelStop, 0.2)

            if (wildFlag) {
                // playSound(R.Sounds.Wild)
            }
        }
    }

    export class BaseSlot extends PIXI.Container{
        public spinSpeed: number = 50;
        public isSpinning: boolean = false;

        protected faceList: any = Faces;
        protected columns: number = 3;
        protected rows: number = 3;
        protected cascadeDelay: number = 150;   
        protected currentSpinning: number = 0;     

        protected slots: Column[] = [];
        protected faces: Face[][] = [];

        constructor() {
            super();
            //this.anchor.set(0.5);
        }

        public CallBack(ResultData: ResultData) {}

        public async waitUntilStop() : Promise<boolean>{

            return true
        }

        public setCascadeDelay(ms: number) {
            this.cascadeDelay = ms;
        }

        public setFaces(faces: any[][]) {
            this.faces = faces;
        }

        async Spin() {
            for(let i = 0; i < this.columns; i++) {
                this.faces[i] = this.slots[i].Spin(this.faces[i]);
                
                await Timer.sleep(this.cascadeDelay);
            }
            this.currentSpinning = this.columns;
        }


        protected async CreateSlots() : Promise<PIXI.Sprite>{
            let slotContainer = new PIXI.Sprite();
            await this.GenerateColumn(slotContainer);
            return slotContainer;
        }

        // protected CreateFrame() {
        //     let texture: PIXI.Texture = PIXI.Texture.from(R.Images.SlotFrame);
        //     let frame = new PIXI.Sprite(texture);
        //     frame.anchor.set(0.5, 0.5);
        //     frame.position.set(0,0);
        //     frame.zIndex++;
        //     this.addChild(frame);
        // }

        protected async GenerateColumn(container:PIXI.Sprite) {
            let startX = -(Tile.Size * this.columns/2);
            let startY = -(Tile.Size * this.rows/2);
            for(let i = 0; i < this.columns; i++) {
                const tileFrames = new PIXI.Container
                for(let y = 0; y < this.rows; y++) {
                    const texture = await PIXI.Assets.load(R.Images.TileFrame);
                    const tileFrame = PIXI.Sprite.from(texture);
                    tileFrame.y = startY + (Tile.Size/2) + (Tile.Size * y);
                    tileFrame.height = Tile.Size;
                    tileFrame.width = Tile.Size;
                    tileFrame.anchor.set(0.5);
                    tileFrames.addChild(tileFrame)
                }
                
                const column = await Column.create(this, this.onSlotDone, this.faceList, this.rows, this.spinSpeed);
                tileFrames.position.x = startX + (Tile.Size * i);
                column.position.x = startX + (Tile.Size * i);
                container.addChild(tileFrames);
                container.addChild(column);
                this.slots.push(column);

                const texture = await PIXI.Assets.load(R.Images.TileOverlay);
                const tileFrame = PIXI.Sprite.from(texture);
                tileFrame.height = Tile.Size*3;
                tileFrame.width = Tile.Size*4;
                tileFrame.anchor.set(0.5);
                container.addChild(tileFrame)
            }
        }

        private onSlotDone() {
            this.currentSpinning -= 1;
            if(this.currentSpinning <= 0) {
                this.onSpinDone();
            }
        }
        
        protected onSpinDone() {
            this.isSpinning = false;
            this.faces = []
        }
    }

    export class Slot extends BaseSlot{
        //public static spinTime: number = 5;
        public size?: {x: number, y: number};
        public turboSpeed: number = 120;
        public betAmount: number = 50;

        protected columns: number = 3;
        protected rows: number = 3;
        public multiplier: number = 1;
        private targetTiles: number = 40;

        public spinSound?: Sound;

        protected faces: Face[][] = [
            [Face.JOKER, Face.JOKER, Face.JOKER],
            [Face.JOKER, Face.JOKER, Face.JOKER],
            [Face.JOKER, Face.JOKER, Face.JOKER],
        ];

        protected multiFaces: Face[][] = [
            [3, 3, 3]
        ];
        
        private multiSlot!: MultiplierSlot;

        constructor() {
            super();

        }

        public static async create(columns: number = 3, rows: number = 3) {
            const instance = new Slot(); // replace YourClass with the name of your class

            const mask = Slot.createMask((columns + 1) * Tile.Size, rows * Tile.Size);
            instance.mask = mask;
            instance.addChild(mask)

            const slotContainer = await instance.CreateSlots();
            instance.addChild(slotContainer);

            instance.sortChildren();

            instance.multiSlot = await MultiplierSlot.create(instance);
            instance.multiSlot.zIndex ++

            slotContainer.addChild(instance.multiSlot);
            instance.multiSlot.x += Math.ceil(columns / 2) * (Tile.Size);

            instance.spinSound = (await PIXI.Assets.load(R.Sounds.Spinning)) as Sound;
            instance.spinSound.loop = true;
            instance.spinSound.volume = 0.25;

            return instance;
        }

        static createMask(width: number, height: number) : PIXI.Graphics {
            let mask = new PIXI.Graphics();
            mask.beginFill(0xffffff);
            mask.drawRect(-width / 2, -height / 2, width, height);
            mask.endFill();

            return mask;
        }


        public generateFaces(columns: number, rows: number) : Face[][] {
            let faces : Face[][] = []
            
            for(let i = 0; i < columns; i++) {
                faces[i] = []
                for(let i2 = 0; i2 < rows; i2++) {
                    faces[i][i2] = Tile.RandomFace(this.faceList);
                }
            }
            return faces;
        }

        public skipSpin() {
            this.slots.forEach((column: Column) => {column.setTargetTiles(column.getCurrentTiles() + 5)})
            this.multiSlot.getSlots().forEach((column: Column) => {column.setTargetTiles(column.getCurrentTiles() + 5)})
        }


        async Spin() {
            if (this.isSpinning) return;

            this.isSpinning = true;

            this.spinSound?.play();

            this.multiSlot.setFaces(this.multiFaces);

            this.slots.forEach((column: Column) => {
                column.setSpeed(this.spinSpeed)
                column.setTargetTiles(this.targetTiles);
            })

            this.multiSlot.getSlots().forEach((column: Column) => {column.setSpeed(this.spinSpeed)});
            this.multiSlot.getSlots().forEach((column: Column) => {column.setTargetTiles(this.targetTiles)});
            

            for(let i = 0; i < this.columns; i++) {

                this.faces[i] = this.slots[i].Spin(this.faces[i]);
                
                await Timer.sleep(this.cascadeDelay);

            }

            this.currentSpinning = this.columns + 1;

            
            this.multiSlot.getSlots().forEach((column: Column, index: number) => {this.multiFaces[index] = column.Spin(this.multiFaces[index])})
        }

        // async TurboSpin() {
        //     if (this.isSpinning) return;

        //     this.isSpinning = true;
        //     for(let i = 0; i < this.columns; i++) {
        //         this.slots[i].setSpeed(this.turboSpeed)
        //         this.slots[i].targetTiles = 10;
        //         this.faces[i] = this.slots[i].Spin(this.faces[i]);
        //     }

        //     this.currentSpinning = this.columns + 1;

        //     this.multiSlot!!.GetSlot().setSpeed(this.turboSpeed)
        //     this.multiSlot!!.GetSlot().targetTiles = 10;
        //     this.multiSlot!!.Spin()

        // }

        public async SetEX(bool: Boolean) {
            await this.multiSlot!!.SetEX(bool);
        }
        
        public setTargetTiles(amount: number) {
            this.targetTiles = amount;
        }


        protected onSpinDone(){
            let rewards: ResultData = this.CalculateMatches();

            if (this.multiSlot!!.getEx()) {
                this.multiplier = MultiplyValue[this.multiFaces[0][1] + 1]
            } else {
                this.multiplier = MultiplyValue[this.multiFaces[0][1]];
            }

            this.multiFaces = [];

            rewards.Multiplier = this.multiplier;
            let total: number = 0;
            for(let i = 0; i < rewards.Rewards.length; i ++) {
                total += rewards.Rewards[i] * rewards.Multiplier;
            }
            rewards.Total = total;

            this.spinSound?.stop();

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

        private ex: Boolean = false;
        private ctx: any;

        constructor(ctx: any){
            super()
            this.ctx = ctx;
        }

        public getEx() {
            return this.ex;
        }

        public static async create(ctx: any) : Promise<MultiplierSlot> {
            const instance = new MultiplierSlot(ctx)

            const slotContainer = await instance.CreateSlots();
            instance.addChild(slotContainer);

            instance.CreateFrame()
            instance.sortChildren();

            return instance
        }


        public getSlots() : Column[] {
            console.log(this.slots.length == 0)
            return this.slots;
        }

        public async SetEX(bool: Boolean) {
            if (bool) {
                this.ex = bool;
                this.faceList = EXMultipliers;
            } else {
                this.ex = bool;
                this.faceList = Multipliers;
            }


            this.slots.forEach(element => {
                element.destroy();
            });
            this.slots = [];

            const slotContainer = await this.CreateSlots();

            
            this.addChild(slotContainer);
            this.sortChildren();
        }

        protected async CreateFrame() {
            let container = new PIXI.Container

            let texture: PIXI.Texture = await PIXI.Assets.load(R.Images.SelectedFrame);
            let frame = new PIXI.Sprite(texture);
            frame.height = Tile.Size;
            frame.width = Tile.Size;
            frame.anchor.set(0.5);
            //frame.position.set(0,0);

            container.addChild(frame);

            let arrowTexture: PIXI.Texture =  await PIXI.Assets.load(R.Images.SlotArrow);
            let arrow = new PIXI.Sprite(arrowTexture);
            arrow.anchor.set(0.5);
            arrow.x = Tile.Size / 2
            arrow.height = Tile.Size - Tile.InnerPadding;
            arrow.width = Tile.Size - Tile.InnerPadding;

            container.addChild(arrow);
            container.x -= Tile.Size / 2;
            container.zIndex = 10;


            //container.x -= Tile.Size;

            this.addChild(container);
        }

        protected onSpinDone() {
            super.onSpinDone();

            this.ctx.onSpinDone();
        }
        
    }

    export interface ResultData{
        Matches: number[][][];
        Rewards: number[];
        Multiplier: number;
        Total: number;
    }
}

export class SlotUI extends PIXI.Container{

    private static incrementTime = 500;

    private enabled: boolean = true;
    
    private betAmount: number = 50;
    private winAmount: number = 50000;
    private betInterval: number = 0; //index
    private ex: boolean = false;
    private turbo: boolean = false;

    
    private betText!: PIXI.Text;
    private winText!: PIXI.Text;
    private rewardPrompt!: PIXI.Container;
    private rewardText!: PIXI.Text;
    private spinButton!: PIXI.Sprite;
    private turboButton!: PIXI.Sprite;
    private betUI!: PIXI.Container;
    private amountContainer!: PIXI.Container;
    private exToggle!: PIXI.Sprite;
    private exMultipy: number = 1;
    private ticker: PIXI.Ticker;

    private spinCooldown: boolean = false;

    constructor() {
        super()
        this.ticker = new PIXI.Ticker();
    }

    static async create() {
        const instance = new SlotUI();

        const buttonContainer = new PIXI.Container;

        instance.spinButton = instance.CreateSpinButton()
        buttonContainer.addChild(instance.spinButton);

        instance.turboButton = await instance.CreateTurboButton()
        instance.turboButton.x -= 325;
        buttonContainer.addChild(instance.turboButton);

        instance.exToggle = instance.CreateEXSwitch()
        instance.exToggle.x -= 200;
        buttonContainer.addChild(instance.exToggle);

        
        instance.betUI = await instance.CreateBetUI()
        instance.betUI.x += 350

        buttonContainer.addChild(instance.betUI)

        instance.addChild(buttonContainer)

        //instance.rewardPrompt = await instance.CreateRewardPrompt();
        //instance.addChild(instance.rewardPrompt)

        instance.amountContainer = await instance.CreateAmount();
        instance.amountContainer.scale.set(
            (Math.max(Math.abs(buttonContainer.getBounds().left * 2), Math.abs(buttonContainer.getBounds().right * 2)) + 20) / instance.amountContainer.width
            );
        instance.amountContainer.y -= 200
        instance.addChild(instance.amountContainer)
        instance.amountContainer.x += instance.amountContainer.width/2
        return(instance)
    }
    

    public SpinButtonCallBack() {}

    public TurboButtonCallBack(bool: boolean) {}

    public OnBetChanged(amount: number) {}

    public OnEXToggle(bool: Boolean) {}

    public getBet() {
        return this.betAmount;
    }

    public setWinAmount(amount: number) {
        this.winText.text = amount;
    }

    public setEnabled(bool: boolean) {
        this.enabled = bool;
        if(bool) {
            // this.eventMode = "static";
            // this.spinButton.eventMode = "static";
            this.turboButton.eventMode = "static";
            this.betUI.eventMode = "static";
        }
        else {
            // this.eventMode = "none";
            // this.spinButton.eventMode = "none";
            this.turboButton.eventMode = "none";
            this.betUI.eventMode = "none";
        }
    }

    public deactivateSpinButton() {
        this.spinButton.eventMode = "none"
    }

    private async CreateBetUI(): Promise<PIXI.Container> {
        const betContainer: PIXI.Container = new PIXI.Container();
        

        const plusTextures = await PIXI.Assets.load([R.Images.Plus, R.Images.PlusDown])
        const incrementButton = new PIXI.Sprite(plusTextures[R.Images.Plus])
        incrementButton.anchor.set(1, 0.5);
        incrementButton.eventMode = 'static';
        incrementButton.on('pointerdown', () => {
            incrementButton.texture = plusTextures[R.Images.PlusDown]
            const buttonFunction = () => {
                incrementButton.texture = plusTextures[R.Images.Plus]
                this.updateBet(1)

                playSound(R.Sounds.Increment)

                window.removeEventListener('pointerup', buttonFunction);
            }

            window.addEventListener('pointerup', buttonFunction);
        })
        // incrementButton.on('pointerup', () => {
        //     incrementButton.texture = plusTextures[R.Images.Plus]
        //     this.updateBet(1)

        //     playSound(R.Sounds.Increment)

        // })
        incrementButton.scale.set(0.17);
        incrementButton.y -= 50;

        betContainer.addChild(incrementButton);


        const minusTextures = await PIXI.Assets.load([R.Images.Minus, R.Images.MinusDown])
        const decrementButton = new PIXI.Sprite(minusTextures[R.Images.Minus])
        decrementButton.anchor.set(1, 0.5);
        decrementButton.eventMode = 'static';
        decrementButton.on('pointerdown', () => {
            decrementButton.texture = minusTextures[R.Images.MinusDown]

            const buttonFunction = () => {
                decrementButton.texture = minusTextures[R.Images.Minus]
                this.updateBet(-1)
                playSound(R.Sounds.Decrement)

                window.removeEventListener('pointerup', buttonFunction);
            }

            window.addEventListener('pointerup', buttonFunction);
        })
        // decrementButton.on('pointerup', () => {
        //     decrementButton.texture = minusTextures[R.Images.Minus]
        //     this.updateBet(-1)

        //     playSound(R.Sounds.Decrement)

        // })
        decrementButton.scale.set(0.17);
        decrementButton.y += 50;


        betContainer.addChild(decrementButton);
        betContainer.pivot.set(betContainer.width, 0)

        

        return(betContainer)
    }

    private CreateSpinButton(): PIXI.Sprite{
        const background  = new PIXI.Graphics();
        background.beginFill(R.Colours.Primary);
        background.drawCircle(0, 0, 50);
        background.endFill();

        const textureUp = PIXI.Texture.from(R.Images.SpinButton);
        const textureDown = PIXI.Texture.from(R.Images.SpinButtonDown);


        const spinButton:PIXI.Sprite = new PIXI.Sprite(textureUp);
        spinButton.anchor.set(0.5);
        spinButton.eventMode = 'static';


        spinButton.on('pointerdown', () => {
            spinButton.eventMode = 'none'
            spinButton.texture = textureDown;

            const spinFunction = async () => {
                window.removeEventListener('pointerup', spinFunction);

                this.setWinAmount(0);
                this.SpinButtonCallBack();

                playSound(R.Sounds.Spin)

                if (!this.turbo) {
                    await Timer.sleep(450)
                } 
                spinButton.eventMode = 'static'
                spinButton.texture = textureUp;
            }

            window.addEventListener('pointerup', spinFunction);
        })

        spinButton.scale.set(0.3);

        return(spinButton);
    }
    

    private async CreateTurboButton() {

        const textures = await PIXI.Assets.load([R.Images.TurboButton, R.Images.TurboButtonDown]);

        const turboButton:PIXI.Sprite = new PIXI.Sprite(textures[R.Images.TurboButton]);
        turboButton.scale.set(0.17);
        turboButton.anchor.set(0, 0.5);
        turboButton.eventMode = 'static';
        turboButton.on('pointerup', () => {
            if(this.turbo){
                turboButton.texture = textures[R.Images.TurboButton];
                this.turbo = false;
                this.TurboButtonCallBack(this.turbo);
            } else {
                turboButton.texture = textures[R.Images.TurboButtonDown];
                this.turbo = true;
                this.TurboButtonCallBack(this.turbo);
            }
            playSound(R.Sounds.Turbo)
        })
        // turboButton.on('pointerup', () => {
        //     turboButton.texture = textures[R.Images.TurboButton];
        //     this.TurboButtonCallBack();
        // })
        return(turboButton);
    }

    private CreateEXSwitch(): PIXI.Sprite {

        const textureOff = PIXI.Texture.from(R.Images.ToggleOff);
        const textureOn = PIXI.Texture.from(R.Images.ToggleOn)

        const exToggle:PIXI.Sprite = new PIXI.Sprite(textureOff);
        exToggle.scale.set(0.17);
        exToggle.anchor.set(0, 0.5);
        exToggle.eventMode = 'static';
        exToggle.on('pointerup', () => {
            if(this.ex){
                exToggle.texture = textureOff;
                this.exMultipy = 1;
                this.ex = false;

                playSound(R.Sounds.ExOff)

            } else {
                exToggle.texture = textureOn;
                this.exMultipy = 1.5;
                this.ex = true;

                playSound(R.Sounds.ExOn)
            }
            this.updateBet(0)
            this.OnEXToggle(this.ex);
        })
        return(exToggle);
    }

    public static async CreateRewardPrompt(reward: number, bet: number, callback: Function) {
        let completed = false;

        let elapsedTime = 0;

        var currentStage = R.Constants.BIG_WIN_AMOUNT;


        const ticker = new PIXI.Ticker();
        ticker.autoStart = true;

        const rewardPromptContainer = new PIXI.Container();
        const texture = await PIXI.Assets.load([R.Images.BigWin, R.Images.MegaWin, R.Images.SuperWin])
        const rewardSprite = PIXI.Sprite.from(texture[R.Images.BigWin]);
        rewardSprite.anchor.set(0.5);
        rewardPromptContainer.addChild(rewardSprite);
        //rewardPromptContainer.pivot.set(rewardPromptContainer.width/2, rewardPromptContainer.height/2)

        
        const rewardText = new PIXI.Text("0", {
            fontFamily: R.Font,
            fontSize:250,
            fontVariant:"small-caps",
            fontWeight:"bold"
        });
        rewardText.anchor.set(0.5);
        rewardPromptContainer.addChild(rewardText);


        playSound(R.Sounds.BigWin)


        const winSound : Sound = await PIXI.Assets.load(R.Sounds.Accumulate);
        winSound.loop = true;
        winSound.play();


        ticker.add((delta) => {
            elapsedTime += delta;
            if (elapsedTime > SlotUI.incrementTime) {
                elapsedTime =  SlotUI.incrementTime
            }

            let currentFactor = elapsedTime/SlotUI.incrementTime;
            let currentReward = Math.floor(reward * currentFactor)
            rewardText.text = currentReward;

            if (currentReward/bet > R.Constants.SUPER_WIN_AMOUNT && currentStage < R.Constants.SUPER_WIN_AMOUNT)  {
                rewardSprite.texture = texture[R.Images.SuperWin]
                currentStage = R.Constants.SUPER_WIN_AMOUNT
                playSound(R.Sounds.SuperWin)


            }
            else if (currentReward/bet > R.Constants.MEGA_WIN_AMOUNT && currentStage < R.Constants.MEGA_WIN_AMOUNT)  {
                rewardSprite.texture = texture[R.Images.MegaWin]
                currentStage = R.Constants.MEGA_WIN_AMOUNT
                playSound(R.Sounds.MegaWin)

            }

            if (elapsedTime == SlotUI.incrementTime) {
                completed = true;
                ticker.destroy();
                callback.call(this)
                winSound.stop();
                playSound(R.Sounds.SubstanstialWin)
            }
        })
        
        rewardPromptContainer.eventMode = 'static'

        window.addEventListener('pointerup', () => {
            if(completed) {
                rewardPromptContainer.destroy();
            } else {
                elapsedTime = SlotUI.incrementTime;
            }
        });
        // rewardPromptContainer.on("click", function() {
        //     if(completed) {
        //         rewardPromptContainer.destroy();
        //     } else {
        //         elapsedTime = SlotUI.incrementTime;
        //     }
        // })
        //rewardPromptContainer.visible = false;
        rewardPromptContainer.y -= 200;

        return(rewardPromptContainer);
    }

    private async CreateAmount() : Promise<PIXI.Container>{
        const amountContainer: PIXI.Container = new PIXI.Container();

        const winContainter = new PIXI.Container();

        
        // const winBackground = Draw.PillShape(300, 50, 0x964B00);
        

        const winBackground = PIXI.Sprite.from(await PIXI.Assets.load(R.Images.WinFrame))
        winContainter.addChild(winBackground)

        const winText = new PIXI.Text("0", {
            fontFamily: R.Font,
            fontSize:42,
            fill: "#ffffff",
            fontVariant:"small-caps",
            fontWeight:"bold"
        });
        winText.anchor.set(0.5);

        winText.position.set(winBackground.width/2 + 55, winBackground.height/2);
        
        this.winText = winText;
        winContainter.addChild(winText);

        winContainter.x = -350; 

        const betContainer = new PIXI.Container();

        const betBackground = PIXI.Sprite.from(await PIXI.Assets.load(R.Images.BetFrame))
        // const betBackground = Draw.PillShape(200, 50, 0x964B00);
        //betBackground.pivot(betBackground.width/2, betBackground.height/2);
        betContainer.addChild(betBackground)

        const betText = new PIXI.Text('50', {
            fontFamily: R.Font,
            fontSize:42,
            fill: "#ffffff",
            fontVariant:"small-caps",
            fontWeight:"bold"
        })
        betText.anchor.set(0.5);
        betText.position.set(betBackground.width/2 + 25, betBackground.height/2);
        this.betText = betText
        betContainer.addChild(betText);
        betContainer.pivot.set(betContainer.width, 0)

        betContainer.x += 350;

        amountContainer.addChild(winContainter);
        amountContainer.addChild(betContainer);

        amountContainer.pivot.set(amountContainer.width/2, amountContainer.height/2)
        
        this.updateBet(this.betInterval)

        return(amountContainer)
    }

    private updateBet(change: number) {
        this.betInterval += change

        if (this.betInterval > amounts.length - 1) {
            this.betInterval = amounts.length - 1;
        } else if (this.betInterval < 0) {
            this.betInterval = 0;
        }

        this.betAmount = amounts[this.betInterval] * this.exMultipy;
        this.betText.text = this.betAmount;
        this.OnBetChanged(this.betAmount)
    }

    // async ShowReward(result: Slots.ResultData) {
    //     this.rewardText.text = R.String.Win + result.Total;
    //     this.rewardPrompt.visible = true;
    //     this.amount += result.Total;
    //     //this.amountText.text =  this.amount;

    //     await Timer.sleep(4000);

    //     this.rewardPrompt.visible = false
    // }

    public GetSpinButtonAbsXPos(){
        return (this.spinButton.position.x + this.position.x)
    }
}


function playSound(src: String, volume: number = 1) : void {
    PIXI.Assets.load(src).then(sound => {
        sound.volume = volume
        sound.play()
    });
}
