import { R } from "./Resource";
import * as PIXI from 'pixi.js';
import { sound, soundAsset } from '@pixi/sound';


const Application = PIXI.Application;
const app = new Application<HTMLCanvasElement>({ resizeTo: window });
app.renderer.background.color = 0x23395D;
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = "absolute";
app.ticker.autoStart = false;
app.renderer.plugins.interaction.moveWhenInside = true;

document.getElementById('pixi-container')?.appendChild(app.view);


import { Slots, SlotUI } from "./Slot";
import { Draw, Timer } from "./Util";

class gameUI extends PIXI.Container{
    private amount: number = 50000;
    private amountText!: PIXI.Text// = new PIXI.Text(0);
    private margin: number = 10;

    constructor() {
        super();
    }

    public static async create() {
        //const spaceWeights = [1, 4, 5, 1]

        const sidePaddingPercent = 5;

        const ui = new gameUI();
        ui.pivot.set(0.5)

        const exitSprite = await ui.createExit();
        ui.addChild(exitSprite);
        
        const amountContainer = await ui.createAmount();
        amountContainer.x = 100
        ui.addChild(amountContainer);

        
        const settingsSprite = await ui.createSettings();
        settingsSprite.x = amountContainer.x + amountContainer.width + 100;
        ui.addChild(settingsSprite);

        ui.pivot.x = ui.width/2
    
        return ui;
    }

    public getAmount() {
        return this.amount;
    }
    
    public deduct(deduction: number) {
        this.amount -= deduction;
        this.amountText.text =  this.amount;
    } 

    public add(addition: number) {
        this.amount += addition;
        this.amountText.text =  this.amount;
    }

    private async createSettings() : Promise<PIXI.Container>{
        const width = 80;
        const height = 80;
        const padding = 40

        const settingContainer: PIXI.Container = new PIXI.Container();

        const background = Draw.PillShape(width, height, 0xFFFFFF);
        background.alpha = 0.3;
        settingContainer.addChild(background);


        const texture = await PIXI.Assets.load(R.Images.Settings)
        const settingsSprite = PIXI.Sprite.from(texture);
        settingsSprite.height = height - padding;
        settingsSprite.width = width - padding;
        settingsSprite.anchor.set(0.5);
        settingsSprite.position.x += background.getBounds().width /2
        settingsSprite.position.y += background.getBounds().height /2
        settingContainer.addChild(settingsSprite);

        return settingContainer;
    }


    private async createExit() : Promise<PIXI.Container>{
        const width = 80;
        const height = 80;
        const padding = 40

        const logoutContainer: PIXI.Container = new PIXI.Container();

        const background = Draw.PillShape(width, height, 0xFFFFFF);
        background.alpha = 0.3;
        logoutContainer.addChild(background);


        const texture = await PIXI.Assets.load(R.Images.Logout)
        const logoutSprite = PIXI.Sprite.from(texture);
        logoutSprite.height = height - padding;
        logoutSprite.width = width - padding;
        logoutSprite.anchor.set(0.5);
        logoutSprite.position.x += background.getBounds().width /2
        logoutSprite.position.y += background.getBounds().height /2
        logoutContainer.addChild(logoutSprite);

        return logoutContainer;
    }

    private async createAmount() : Promise<PIXI.Container>{
        const width = 500;
        const height = 80;
        const padding = 20

        const amountContainer: PIXI.Container = new PIXI.Container();

        const background = Draw.PillShape(width, height, 0xFFFFFF)
        background.pivot.set(0.5)
        background.alpha = 0.3;
        amountContainer.addChild(background);

        const texture = await PIXI.Assets.load(R.Images.Chip)
        const chipSprite = PIXI.Sprite.from(texture);
        chipSprite.height = height - padding;
        chipSprite.width = height - padding;
        chipSprite.anchor.set(0, 0.5);
        chipSprite.position.x += padding;
        chipSprite.position.y = amountContainer.height/2
        amountContainer.addChild(chipSprite);

        const amountText = new PIXI.Text(this.amount, {
            fontFamily: R.Font,
            fontSize:60,
            fontVariant:"small-caps",
            fontWeight:"bold"
        });
        amountText.height = height;
        amountText.position.x += chipSprite.x + chipSprite.width + padding
        amountText.position.y = amountContainer.height/2
        amountText.anchor.set(0, 0.5);
        this.amountText = amountText;
        amountContainer.addChild(amountText);

        return amountContainer;
    }
}
namespace SlotStage{

    async function preloadAssets() {
        const images = [
            R.Images.Wild,
            R.Images.RedClown,
            R.Images.BlueClown,
            R.Images.GreenClown,
            R.Images.Elephant,
            R.Images.Tiger,
            R.Images.Horse,
            R.Images.Monkey,
            R.Images.TileFrame,
            R.Images.SelectedFrame,
            R.Images.SlotArrow,
            R.Images.Background,
            R.Images.Logout,
            R.Images.Settings,
            R.Images.BetFrame,
            R.Images.WinFrame,
            R.Images.BigWin,
            R.Images.SuperWin,
            R.Images.MegaWin,
            R.Images.TileOverlay,
            R.Images.Title,
            R.Images.Multi_EX2,
            R.Images.Multi_EX3,
            R.Images.Multi_EX5,
            R.Images.Multi_EX10,
            R.Images.Multi_EX15,
            R.Images.Multi_1,
            R.Images.Multi_2,
            R.Images.Multi_3,
            R.Images.Multi_5,
            R.Images.Multi_10,
            R.Images.Multi_15,
        ];

        const sounds = [
            R.Sounds.BigWin,
            R.Sounds.Decrement,
            R.Sounds.Turbo,
            R.Sounds.Increment,
            R.Sounds.MegaWin,
            R.Sounds.SuperWin,
            R.Sounds.Wild,
            R.Sounds.SubstanstialWin,
            R.Sounds.Accumulate,
            R.Sounds.Background,
            R.Sounds.ExOff,
            R.Sounds.ExOn,
            R.Sounds.ReelStop,
            R.Sounds.Win,
            R.Sounds.Spin
        ]
    
        for (let image of images) {
            PIXI.Assets.add({alias: image, src: image});
            PIXI.Assets.load(image);
        }
        for (let sound of sounds) {
            PIXI.Assets.add({alias: sound, src: sound, loadParser: soundAsset});
            PIXI.Assets.backgroundLoad(sound);
        }
        PIXI.Assets.add({alias: R.Font, src: R.Font});
    }


    async function createBackground() {
        const backgroundTexture = await PIXI.Assets.load(R.Images.Background)
        const background = PIXI.Sprite.from(backgroundTexture);
        background.anchor.set(0.5);

        let scaleX = app.screen.width / background.width;
        let scaleY = app.screen.height / background.height;
        let scale = Math.min(scaleX, scaleY);
        
        background.scale.set(scale);

        return background
    }


    async function main() {

        const loadingTextPlaceHolder = new PIXI.Text("Loading", {
            fontFamily: R.Font,
            fontSize:23,
            fontVariant:"small-caps",
            fontWeight:"bold"
        })
    
        loadingTextPlaceHolder.anchor.set(0.5, 0.5)
        loadingTextPlaceHolder.position.set(app.screen.width/2, app.screen.height/2)
        app.stage.addChild(loadingTextPlaceHolder);
        

        await preloadAssets()


        PIXI.Assets.load(R.Sounds.Background).then(sound => {
            sound.loop = true;
            sound.volume = 0.25;
            sound.play()
        });
        
        
        
        const contentContainer = new PIXI.Container()
        contentContainer.y = app.screen.height / 2;
        contentContainer.x = app.screen.width / 2;

        const background = await createBackground();
        contentContainer.addChild(background);

        
        
    
        const mainUI = await gameUI.create()
        const fillWidthScale = contentContainer.width/mainUI.width
        mainUI.scale.set(fillWidthScale);
        mainUI.position.set(0, -contentContainer.height/2)

        


        const gameStage = new PIXI.Container;

        const slot = await Slots.Slot.create(3,3);
        gameStage.addChild(slot);

        const UI = await SlotUI.create();

        // var graphics = new PIXI.Graphics();
        // graphics.beginFill(0xFFFF00);
        // graphics.alpha = 0.2
        // graphics.drawRect(0, 0, UI.getBounds().width, UI.getBounds().height);
        // graphics.pivot.set(graphics.width/2, graphics.height/2)
        // UI.addChild(graphics);
        
        

        UI.pivot.set(0, UI.getBounds().top)
        let scaleUI = gameStage.width/Math.abs(UI.getLocalBounds().left*2);
        UI.scale.set(scaleUI)
        
        UI.y = slot.getBounds().bottom
        
        UI.SpinButtonCallBack = function() {
            if (!slot.isSpinning && mainUI.getAmount() > UI.getBet()) {
                slot.Spin();
                mainUI.deduct(UI.getBet());
                UI.setEnabled(false)
            } else if (slot.isSpinning) {
                slot.skipSpin();
                UI.deactivateSpinButton();
            }
        }

        UI.TurboButtonCallBack = function(bool: boolean) {
            // if (!slot.isSpinning && mainUI.getAmount() > UI.getBet()) {
            //     slot.TurboSpin();
            //     mainUI.deduct(UI.getBet());
            // }
            if (bool) {
                slot.spinSpeed = 90
                slot.setTargetTiles(20)
                slot.setCascadeDelay(0)
            }
            else {
                slot.spinSpeed = 50
                slot.setTargetTiles(40)
                slot.setCascadeDelay(150)
            }
        }

        UI.OnBetChanged = async (amount: number) => {
            await slot.waitUntilStop()
            slot.betAmount = amount
        };

        UI.OnEXToggle = (bool: Boolean) => {
            slot.SetEX(bool)
        };

        slot.CallBack = async (ResultData: Slots.ResultData) => {
            //UI.ShowReward(ResultData);
            UI.eventMode = "none";
            await Timer.sleep(300);
            if (ResultData.Total/slot.betAmount >= R.Constants.BIG_WIN_AMOUNT) {

                const rewardPrompt = await SlotUI.CreateRewardPrompt(ResultData.Total, slot.betAmount, () => {
                    UI.setWinAmount(ResultData.Total)
                    mainUI.add(ResultData.Total)
                    UI.setEnabled(true)
                    UI.eventMode = "static";
                });
                rewardPrompt.scale.set(contentContainer.width/rewardPrompt.width * 0.8);
                rewardPrompt.y = contentContainer.y
                rewardPrompt.x = contentContainer.x
                app.stage.addChild(rewardPrompt)
            } else {
                UI.setWinAmount(ResultData.Total)
                UI.setEnabled(true)
                UI.eventMode = "static";
                if (ResultData.Total > 0){
                    mainUI.add(ResultData.Total)
                    PIXI.Assets.load(R.Sounds.Win).then(sound => {
                        sound.play()
                    });
                }
            }
        }
        gameStage.addChild(UI);

        let scaleX = background.width/gameStage.width;
        gameStage.scale.set(scaleX)

        contentContainer.addChild(gameStage);

        contentContainer.addChild(mainUI);


        // const title = PIXI.Sprite.from(await PIXI.Assets.load(R.Images.Title));
        // const slotTop = slot.getGlobalPosition().y - slot.height/2
        // const uiBottom = mainUI.getGlobalPosition().y - mainUI.height/2

        // const scaleTitle = (slotTop-uiBottom)/title.height
        // title.scale.set(scaleTitle);
        // title.anchor.set(0.5, 0);
        // contentContainer.addChild(title);
        // console.log(slot.getGlobalPosition().y, slot.getGlobalPosition().y - slot.height/2 + title.y)
        // title.y = mainUI.getGlobalPosition().y - title.getGlobalPosition().y
        

        app.stage.addChild(contentContainer);

        loadingTextPlaceHolder.destroy();
        console.log("Loaded")

    }
    

    main();
}

namespace Load {
    const loadingTextPlaceHolder = new PIXI.Text("Loading", {
        fontFamily: R.Font,
        fontSize:23,
        fontVariant:"small-caps",
        fontWeight:"bold"
    })

    export function startLoad() {
        loadingTextPlaceHolder.anchor.set(0.5, 0.5)
        loadingTextPlaceHolder.position.set(app.screen.width/2, app.screen.height/2)
        app.stage.addChild(loadingTextPlaceHolder);
    }

    export function stopLoad() {
        loadingTextPlaceHolder.destroy();
        console.log("Loaded")
    }
}