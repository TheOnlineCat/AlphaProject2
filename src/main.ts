import { R } from "./Resource";
import * as PIXI from 'pixi.js';


const Application = PIXI.Application;
const app = new Application<HTMLCanvasElement>({ resizeTo: window });
app.renderer.background.color = 0x23395D;
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = "absolute";
app.ticker.autoStart = false;

document.getElementById('pixi-container')?.appendChild(app.view);


import { Slots, SlotUI } from "./Slot";
namespace SlotStage{
    const gameStage = new PIXI.Container;

    gameStage.y = app.screen.height / 2;
    gameStage.x = app.screen.width / 2;

    const backgroundTexture = PIXI.Texture.from(R.Images.Background)
    const background = PIXI.Sprite.from(backgroundTexture);
    background.anchor.set(0.5);
    if ((app.screen.height / app.screen.width) < 1) {
        const oldHeight = 1080;
        background.height = app.screen.height;
        background.scale.set(background.height/oldHeight, 1)
    }
    else {
        const oldWidth = background.width;
        background.width = app.screen.width;
        background.scale.set(1, background.width/oldWidth)
    }
    gameStage.width = background.width;
    gameStage.height = background.height;
    

    const UI: SlotUI = new SlotUI();

    const slot: Slots.Slot = new Slots.Slot();

    const resizeFactor = background.width/slot.size.x;
    console.log(gameStage.width)
    
    UI.y = (slot.size.y / 2)
    UI.scale.set(0.4)
    UI.SpinButtonCallBack = function() {
        slot.Spin();
        UI.Deduct();
    }

    UI.TurboButtonCallBack = function() {
        slot.TurboSpin();
        UI.Deduct();
    }

    UI.OnBetChanged = (amount: number) => {
        slot.betAmount = amount
    };

    UI.OnEXToggle = (bool: Boolean) => {
        slot.SetEX(bool)
    };

    slot.anchor.set(0.5)
    //slot.scale.set(resizeFactor)


    slot.CallBack = (ResultData: any) => {
        UI.ShowReward(ResultData);
    }

    gameStage.addChild(slot);
    gameStage.addChild(UI);
    app.stage.addChild(background);
    app.stage.addChild(gameStage);
}

