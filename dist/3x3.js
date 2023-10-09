var _a;
import * as PIXI from "pixi.js";
import './style.css';
import { Config } from "./config";
const Application = PIXI.Application;
const Renderer = PIXI.Renderer;
const Graphics = PIXI.Graphics;
const app = new Application({ resizeTo: window });
app.renderer.background.color = 0x23395D;
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = "absolute";
document.body.appendChild(app.view);
let mouseCoords = { x: 0, y: 0 };
// const mouseMove = ((event:	PIXI.FederatedPointerEvent) =>
// {
//     mouseCoords.x = event.global.x;
//     mouseCoords.y = event.global.y;
// });
const path = Config.Resource;
export var Face;
(function (Face) {
    Face[Face["JOKER"] = 1] = "JOKER";
    Face[Face["REDCLOWN"] = 2] = "REDCLOWN";
})(Face || (Face = {}));
const Resources = [
    `${path}/joker.png`,
];
const Texture = PIXI.Texture;
export class Tile extends PIXI.Sprite {
    constructor(face) {
        let texture = Texture.from(Resources[face]);
        super(texture);
        this.height = 30;
        this.width = 30;
    }
}
export class Column extends PIXI.Sprite {
    constructor() {
        super();
        this.stripLength = 5;
        this.tileArray = (Array);
        for (let i = 0; i < this.stripLength; i++) {
            let tile = new Tile(Face.JOKER);
            tile.y = tile.height * i;
            //this.tileArray[i] = tile;
            this.addChild(tile);
        }
    }
    Spin() {
    }
}
(_a = document.getElementById('pixi-container')) === null || _a === void 0 ? void 0 : _a.appendChild(app.view);
const column = new Column();
app.stage.addChild(column);
console.log("yes");
