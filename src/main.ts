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

const UI: SlotUI = new SlotUI();

const slot: Slots.Slot = new Slots.Slot();

namespace SlotStage{
    UI.y = app.screen.height*0.9
    UI.x = app.screen.width/2
    UI.ButtonCallBack = function() {
        slot.Spin();
        UI.Deduct();
    }

    UI.OnBetChanged = (amount: number) => {
        slot.betAmount = amount
    };

    slot.anchor.set(0.5)
    slot.scale.set(1)
    slot.x = app.screen.width/2
    slot.y = app.screen.height * 0.3

    slot.CallBack = (ResultData: any) => {
        console.log(ResultData)
        UI.ShowReward(ResultData);
    }
}

app.stage.addChild(slot);
app.stage.addChild(UI);