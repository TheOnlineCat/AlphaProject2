import { Timer } from "./Util";
import { R } from "./Resource";
import * as PIXI from 'pixi.js';

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
    
        constructor(face: number) {
            super();
            this.face = face;
        }
    
        static async create(face: number, images: any) {
            let tile = new Tile(face);
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
    }

    class Column extends PIXI.Container{
        private hiddenPadding: number = 1;
        private speed: number = 20;
        private stripLength: number = 3;
        
        private faceList: any;
        private currentSpeed: number = 20;
        private tileArray : Tile[] = [];
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
        }

        public static async create(ctx: any, callback: Function, facelist: any, length: number = 0, spinSpeed: number = 20) {
            const instance = new Column(ctx, callback, facelist, length, spinSpeed)

            let startPosition = (Tile.Size * instance.hiddenPadding);
            for(let i = 0; i < instance.stripLength + instance.hiddenPadding; i++) {
                let tile = await Tile.create(Tile.RandomFace(instance.faceList), instance.faceList);
                tile.y = (Tile.Size * i + 1);
                instance.tileArray[i] = tile;
                instance.addChild(tile);
            }

            return instance;
        }

        public setSpeed(speed: number) {
            this.speed = speed;
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

        async UpdateSpin(delta: number) {
            this.y += delta * this.currentSpeed;

            let relativePos = this.position.y;
            let tileElapsed = Math.floor((relativePos / Tile.Size));

            if (tileElapsed < (this.targetTiles - this.stripLength - this.hiddenPadding)) {
                for(let i = 0; i < tileElapsed - this.currentTile; i++) {
                    let tile = await this.GenerateTile(Tile.RandomFace(this.faceList));
                    this.AddTile(tile);
                }
            }
            else if (tileElapsed < this.targetTiles) {
                for(let i = 0; i < tileElapsed - this.currentTile; i++)  {
                    let face = this.resultFaces.shift();
                    if (face != undefined) {
                        let tile = await (this.GenerateTile(face));
                        this.addChild(tile);
                        this.tileArray.push(tile);
                        this.addChild(tile);
                    }
                    else {
                        let tile = await this.GenerateTile(Tile.RandomFace(this.faceList));
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

        private async GenerateColumn(container:PIXI.Sprite) {
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
        public multiplier: number = 1;

        protected faces: Face[][] = [
        ];
        
        private multiSlot?: MultiplierSlot;

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

            return instance;
        }

        static createMask(width: number, height: number) : PIXI.Graphics {
            let mask = new PIXI.Graphics();
            mask.beginFill(0xffffff);
            mask.drawRect(-width / 2, -height / 2, width, height);
            mask.endFill();

            return mask;
        }


        async Spin() {
            if (this.isSpinning) return;

            this.isSpinning = true;
            for(let i = 0; i < this.columns; i++) {
                this.slots[i].setSpeed(this.spinSpeed)
                this.slots[i].targetTiles = 40;
                this.faces[i] = this.slots[i].Spin(this.faces[i]);
                
                await Timer.sleep(this.cascadeDelay);
            }

            this.currentSpinning = this.columns + 1;

            this.multiSlot!!.GetSlot().setSpeed(this.spinSpeed)
            this.multiSlot!!.GetSlot().targetTiles = 40;
            this.multiSlot!!.Spin()
        }

        async TurboSpin() {
            if (this.isSpinning) return;

            this.isSpinning = true;
            for(let i = 0; i < this.columns; i++) {
                this.slots[i].setSpeed(this.turboSpeed)
                this.slots[i].targetTiles = 10;
                this.faces[i] = this.slots[i].Spin(this.faces[i]);
            }

            this.currentSpinning = this.columns + 1;

            this.multiSlot!!.GetSlot().setSpeed(this.turboSpeed)
            this.multiSlot!!.GetSlot().targetTiles = 10;
            this.multiSlot!!.Spin()

        }

        public SetEX(bool: Boolean) {
            this.multiSlot!!.SetEX(bool);
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

        private ex: Boolean = false;
        private ctx: any;

        constructor(ctx: any){
            super()
            this.ctx = ctx;
        }

        public static async create(ctx: any) : Promise<MultiplierSlot> {
            const instance = new MultiplierSlot(ctx)

            const slotContainer = await instance.CreateSlots();
            instance.addChild(slotContainer);

            instance.CreateFrame()
            instance.sortChildren();

            return instance
        }


        public GetSlot() : Column{
            return this.slots[0]
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
            if (this.ex) {
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

export class SlotUI extends PIXI.Container{
    
    private betAmount: number = 50;
    private amount: number = 50000;
    private amountInterval: number = 0; //index
    private ex: boolean = false;

    private amountText!: PIXI.Text;
    private betText!: PIXI.Text;
    private rewardPrompt: PIXI.Text;
    private spinButton: PIXI.Sprite;
    private turboButton: PIXI.Sprite;
    private amountContainer: PIXI.Container;
    private exToggle: PIXI.Sprite;
    private exMultipy: number = 1;

    constructor() {
        super()

        this.amountContainer = this.CreateAmount();
        this.addChild(this.amountContainer)

        const buttonContainer = new PIXI.Container;

        this.rewardPrompt = this.CreateRewardPrompt();
        buttonContainer.addChild(this.rewardPrompt)

        this.spinButton = this.CreateSpinButton()
        buttonContainer.addChild(this.spinButton);

        this.turboButton = this.CreateTurboButton()
        buttonContainer.addChild(this.turboButton);

        this.exToggle = this.CreateEXSwitch()
        buttonContainer.addChild(this.exToggle);

        const amountUI = this.CreateAmountUI()
        buttonContainer.addChild(amountUI);
        
        buttonContainer.y += 150
        buttonContainer.scale.set(0.8);
        this.addChild(buttonContainer)
    }

    public Deduct() {
        this.amount -= this.betAmount;
        this.amountText.text =  this.amount;
    }

    public SpinButtonCallBack() {}

    public TurboButtonCallBack() {}

    public OnBetChanged(amount: number) {}

    public OnEXToggle(bool: Boolean) {}

    private CreateAmountUI(): PIXI.Container {
        const betContainer: PIXI.Container = new PIXI.Container();
        betContainer.x += 200

        PIXI.Assets.load([R.Images.Plus, R.Images.PlusDown]).then( (textures) => {
            const incrementButton = new PIXI.Sprite(textures[R.Images.Plus])
            incrementButton.anchor.set(0.5);
            incrementButton.eventMode = 'static';
            incrementButton.on('mousedown', () => {
                incrementButton.texture = textures[R.Images.PlusDown]
            })
            incrementButton.on('mouseup', () => {
                incrementButton.texture = textures[R.Images.Plus]
                this.updateBet(1)
            })
            incrementButton.y -= 50;
            incrementButton.scale.set(0.17);

            betContainer.addChild(incrementButton);
        })


        PIXI.Assets.load([R.Images.Minus, R.Images.MinusDown]).then( (textures) => {
            const decrementButton = new PIXI.Sprite(textures[R.Images.Minus])
            decrementButton.anchor.set(0.5);
            decrementButton.eventMode = 'static';
            decrementButton.on('mousedown', () => {
                decrementButton.texture = textures[R.Images.MinusDown]
            })
            decrementButton.on('mouseup', () => {
                decrementButton.texture = textures[R.Images.Minus]
                this.updateBet(-1)
            })
            decrementButton.y += 50;
            decrementButton.scale.set(0.17);

            betContainer.addChild(decrementButton);
        })

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

        //const spinButton = new PIXI.Container();
        spinButton.eventMode = 'static';
        spinButton.on('mousedown', () => {
            spinButton.texture = textureDown;
        })
        spinButton.on('mouseup', () => {
            spinButton.texture = textureUp;
            this.SpinButtonCallBack();
        })
        spinButton.scale.set(0.3);
        //spinButton.addChild(background);
        //spinButton.addChild(spinIcon);

        return(spinButton);
    }

    private CreateTurboButton(): PIXI.Sprite {

        const textureUp = PIXI.Texture.from(R.Images.TurboButton);
        const textureDown = PIXI.Texture.from(R.Images.TurboButtonDown)

        const turboButton:PIXI.Sprite = new PIXI.Sprite(textureUp);
        turboButton.scale.set(0.17);
        turboButton.anchor.set(0.5);
        turboButton.x -= 250;
        turboButton.eventMode = 'static';
        turboButton.on('mousedown', () => {
            turboButton.texture = textureDown;
        })
        turboButton.on('mouseup', () => {
            turboButton.texture = textureUp;
            this.TurboButtonCallBack();
        })
        return(turboButton);
    }

    private CreateEXSwitch(): PIXI.Sprite {

        const textureOff = PIXI.Texture.from(R.Images.ToggleOff);
        const textureOn = PIXI.Texture.from(R.Images.ToggleOn)

        const exToggle:PIXI.Sprite = new PIXI.Sprite(textureOff);
        exToggle.scale.set(0.17);
        exToggle.anchor.set(0.5);
        exToggle.x -= 150;
        exToggle.eventMode = 'static';
        exToggle.on('click', () => {
            if(this.ex){
                exToggle.texture = textureOff;
                this.exMultipy = 1;
                this.ex = false;
            } else {
                exToggle.texture = textureOn;
                this.exMultipy = 1.5;
                this.ex = true;
            }
            this.updateBet(0)
            this.OnEXToggle(this.ex);
        })
        return(exToggle);
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

    private CreateAmount() : PIXI.Container{
        const amountContainer: PIXI.Container = new PIXI.Container();


        const amountText = new PIXI.Text(this.amount, {
            fontFamily:"Verdana",
            fontSize:24,
            fontVariant:"small-caps",
            fontWeight:"bold"
        });
        amountText.anchor.set(0.5);
        amountText.x -= 250;
        this.amountText = amountText;
        amountContainer.addChild(amountText);


        const betText = new PIXI.Text('50', {
            fontFamily:"Verdana",
            fontSize:24,
            fontVariant:"small-caps",
            fontWeight:"bold"
        })
        betText.anchor.set(0.5);
        betText.x += 250
        this.betText = betText
        amountContainer.addChild(betText);
        
        this.updateBet(this.amountInterval)

        return(amountContainer)
    }

    private updateBet(change: number) {
        this.amountInterval += change

        if (this.amountInterval > amounts.length - 1) {
            this.amountInterval = amounts.length - 1;
        } else if (this.amountInterval < 0) {
            this.amountInterval = 0;
        }

        this.betAmount = amounts[this.amountInterval] * this.exMultipy;
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

    public GetSpinButtonAbsXPos(){
        return (this.spinButton.position.x + this.position.x)
    }
}
