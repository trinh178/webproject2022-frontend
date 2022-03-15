import { ERoomOption } from "./types";
import { EObject } from "./eobject";
import { convertWindowPostionToCanvasPosition } from "./common";

export class ERoom {
    canvas: HTMLCanvasElement;
    canvasCxt: CanvasRenderingContext2D;
    eObjects: EObject[];
    option: ERoomOption;
    interval: any;
    #_handleUpdate: () => void;
    
    // Event listeners
    mouseDownEventListener: EventListener;
    mouseMoveEventListener: EventListener;
    mouseUpEventListener: EventListener;

    constructor(canvas: HTMLCanvasElement, option?: ERoomOption | {}) {
        this.canvas = canvas;
        this.canvasCxt = canvas.getContext("2d");
        this.eObjects = [];
        this.option = {
            // default
            limitFps: 120,
            // custom
            ...option,
        }

        // Event
        this.#_addEventListeners();
    }

    #_update() {
        this.#_handleUpdate();
    }
    #_draw() {
        this.canvasCxt.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.eObjects.forEach(eo => eo.onDraw(this.canvasCxt));
    }
    #_addEventListeners() {
        this.mouseDownEventListener = (ev: MouseEvent) => {
            const { x: mouseX, y: mouseY } = convertWindowPostionToCanvasPosition(this.canvas, {
                x: ev.clientX,
                y: ev.clientY,
            });

            let firstBreak: boolean = false;
            for (let i = this.eObjects.length - 1; i >= 0; i--) {
                const eo = this.eObjects[i];
                if (eo.isCollisionPosition(mouseX, mouseY) && !firstBreak) {
                    eo.onEvent("MOUSE_DOWN_INSIDE",  { mouseX, mouseY });
                    firstBreak = true;
                } else {
                    eo.onEvent("MOUSE_DOWN_OUTSIDE",  { mouseX, mouseY });
                }
            }
        };
        this.mouseUpEventListener = (ev: MouseEvent) => {
            const { x: mouseX, y: mouseY } = convertWindowPostionToCanvasPosition(this.canvas, {
                x: ev.clientX,
                y: ev.clientY,
            });

            for (const eo of this.eObjects) {
                if (eo.isCollisionPosition(mouseX, mouseY)) {
                    eo.onEvent("MOUSE_UP_INSIDE");
                } else {
                    eo.onEvent("MOUSE_UP_OUTSIDE");
                }
            }
        };
        this.mouseMoveEventListener = (ev: MouseEvent) => {
            const { x: mouseX, y: mouseY } = convertWindowPostionToCanvasPosition(this.canvas, {
                x: ev.clientX,
                y: ev.clientY,
            });

            this.eObjects.forEach(eo => {
                eo.onEvent("MOUSE_MOVE", {
                    mouseX: mouseX,
                    mouseY: mouseY,
                });
            });
        }

        this.canvas.addEventListener("mousedown", this.mouseDownEventListener);
        this.canvas.addEventListener("mouseup", this.mouseUpEventListener);
        this.canvas.addEventListener("mousemove", this.mouseMoveEventListener);
    }
    #_removeEventListeners() {
        this.canvas.removeEventListener("mousedown", this.mouseDownEventListener);
        this.canvas.removeEventListener("mouseup", this.mouseUpEventListener);
        this.canvas.removeEventListener("mousemove", this.mouseMoveEventListener);
    }

    addObject(eObject: EObject, x?: number, y?: number) {
        eObject.x = x || eObject.x;
        eObject.y = y || eObject.y;
        this.eObjects.push(eObject);
        eObject.eRoom = this;
        eObject.onJoinRoom();
    }
    removeObject(eObject: EObject) {
        eObject.onLeftRoom();
        eObject.eRoom = null;
        this.eObjects = this.eObjects.filter(eo => eo !== eObject);
    }
    removeAllObject() {
        this.eObjects.forEach(eo => this.removeObject(eo));
    }
    play() {
        this.interval = setInterval(() => {
            this.#_update();
            this.#_draw();
        }, 1000 / this.option.limitFps);
    }
    stop() {
        clearInterval(this.interval);
    }
    destroy() {
        this.removeAllObject();
        this.#_draw();
        this.stop();
        this.#_removeEventListeners();
    }
    forcusObject(eObject: EObject) {
        this.removeObject(eObject);
        this.addObject(eObject);
    }

    // Events
    onUpdate(handler: () => void) {
        this.#_handleUpdate = handler;
    }
}