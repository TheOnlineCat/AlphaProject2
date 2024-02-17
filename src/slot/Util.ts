import * as PIXI from 'pixi.js';

export namespace Timer {
    export function sleep(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}

export namespace Draw{
    export function Circle(radius: number) {
        const gr  = new PIXI.Graphics();
        gr.beginFill(0xffffff);
        gr.drawCircle(0, 0, radius);
        gr.endFill();
        return gr;
    }
    
    export function PillShape(length: number, height: number, colour: any) {
        const gr  = new PIXI.Graphics();
        gr.beginFill(colour);
        gr.drawRoundedRect(0, 0, length, height, height*2);
        gr.endFill();
        return gr;
    }
}
