import { R } from "./Resource";
import * as PIXI from 'pixi.js';


const Application = PIXI.Application;
const app = new Application<HTMLCanvasElement>({ resizeTo: window });
app.renderer.background.color = 0x23395D;
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = "absolute";
app.ticker.autoStart = false;

document.getElementById('pixi-container')?.appendChild(app.view);


import { Slots } from "./Slot";
import { Timer } from "./Util";
namespace SlotStage{

    const amounts: number[] = [50, 100, 250, 500, 1500, 2500, 5000];

    let amountInterval: number = 0; //index

    let prize:number = 0;

    const slot = new Slots.Slot(ShowReward);
    slot.scale.set(1.2)
    slot.x = app.screen.width/2
    slot.y = app.screen.height * 0.4
    app.stage.addChild(slot);

    const UIContainer: PIXI.Sprite = new PIXI.Sprite();
    UIContainer.anchor.set(0.5);
    UIContainer.y = app.screen.height*0.9
    UIContainer.x = app.screen.width/2

    const spinButton:PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.from(R.Images.SpinButton));
    spinButton.scale.set(0.3)
    spinButton.anchor.set(0.5);
    spinButton.eventMode = 'static';
    spinButton.on('click', () => {
        slot.Spin();
    })
    UIContainer.addChild(spinButton);

    const amountContainer: PIXI.Sprite = new PIXI.Sprite();
    amountContainer.anchor.set(0.5);
    amountContainer.x += 400
    amountContainer.scale.set(0.1);

    const decrementButton: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.from(R.Images.MinusIcon));
    decrementButton.anchor.set(0.5);
    decrementButton.eventMode = 'static';
    decrementButton.x -= 1500;
    decrementButton.on('click', () => {
        updateAmount(-1)
    })
    amountContainer.addChild(decrementButton);

    const amountText = new PIXI.Text('50', {
        fontFamily:"Verdana",
        fontSize:500,
        fontVariant:"small-caps",
        fontWeight:"bold"
    })
    amountText.anchor.set(0.5);
    amountContainer.addChild(amountText);

    const incrementButton: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.from(R.Images.PlusIcon));
    incrementButton.anchor.set(0.5);
    incrementButton.x += 1500;
    incrementButton.eventMode = 'static';
    incrementButton.on('click', () => {
        updateAmount(1)
    })
    amountContainer.addChild(incrementButton);

    UIContainer.addChild(amountContainer);
    updateAmount(amountInterval)

    const rewardText = new PIXI.Text("", {
        fontFamily:"Verdana",
        fontSize:100,
        fontVariant:"small-caps",
        fontWeight:"bold"
    })
    rewardText.visible = false
    rewardText.y += 200
    rewardText.anchor.set(0.5);
    UIContainer.addChild(rewardText);

    app.stage.addChild(UIContainer)



    function updateAmount(change: number) {
        amountInterval += change

        if (amountInterval > amounts.length - 1) {
            amountInterval = amounts.length - 1;
        } else if (amountInterval < 0) {
            amountInterval = 0;
        }

        rewardText.text = amounts[amountInterval];
        slot.rowReward = amounts[amountInterval]/5;
    }


    async function ShowReward(result: Slots.ResultData) {
        rewardText.text = R.String.Win + result.Total;
        rewardText.visible = true;

        await Timer.sleep(2000);

        rewardText.visible = false
    }
}

