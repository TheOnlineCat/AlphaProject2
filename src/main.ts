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

    async function preloadImages() {
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
            R.Images.Background
        ];
    
        for (let image of images) {
            PIXI.Assets.add({alias: image, src: image});
            await PIXI.Assets.load(image);
        }
    }

    async function createBackground() {
        const backgroundTexture = await PIXI.Assets.load(R.Images.Background)
        const background = PIXI.Sprite.from(backgroundTexture);
        background.anchor.set(0.5);
        background.position.set(app.screen.width / 2,app.screen.height / 2);

        let scaleX = app.screen.width / background.width;
        let scaleY = app.screen.height / background.height;
        let scale = Math.min(scaleX, scaleY);
        
        background.scale.set(scale);

        return background
    }


    async function main() {
        await preloadImages()

        const background = await createBackground();
        app.stage.addChild(background);

        const gameStage = new PIXI.Container;
        gameStage.y = app.screen.height / 2;
        gameStage.x = app.screen.width / 2;

        const slot = await Slots.Slot.create(3,3);
        gameStage.addChild(slot);

        const UI: SlotUI = new SlotUI();
        let scaleUI = gameStage.width/UI.width;
        UI.scale.set(scaleUI)
        UI.y += (slot.height/2) * scaleUI + 20
        UI.x += 7;

        UI.SpinButtonCallBack = function() {
            if (!slot.isSpinning) {
                slot.Spin();
                UI.Deduct();
            }
        }

        UI.TurboButtonCallBack = function() {
            if (!slot.isSpinning) {
                slot.TurboSpin();
                UI.Deduct();
            }
        }

        UI.OnBetChanged = (amount: number) => {
            slot.betAmount = amount
        };

        UI.OnEXToggle = (bool: Boolean) => {
            slot.SetEX(bool)
        };

        slot.CallBack = (ResultData: any) => {
            UI.ShowReward(ResultData);
        }
        gameStage.addChild(UI);
        

        let scaleX = background.width/gameStage.width;
        gameStage.scale.set(scaleX)
    
        app.stage.addChild(gameStage);
        }

        main();
}

