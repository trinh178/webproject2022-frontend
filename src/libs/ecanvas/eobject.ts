import { EObjectOption, EObjectState, EEventType, EEventData } from "./types";
import { ERoom } from "./eroom";
import { distance } from "mathjs";

export class EObject {
    //sortingOrder: number;
    x: number;
    y: number;
    option: EObjectOption;
    state: EObjectState;
    mouseOriginX: number;
    mouseOriginY: number;
    eRoom: ERoom;

    constructor(option?: EObjectOption | {}) {
        this.x = 0;
        this.y = 0;
        this.option = {
            allowDragDrop: false,
            ...option,
        }
        this.state = "NONE";
        this.eRoom = null;
    }

    // Events
    onJoinRoom(): void {
        
    }
    onDraw(ctx: CanvasRenderingContext2D): void {

    }
    onEvent(ev: EEventType, evData?: EEventData): void {
        if (ev === "MOUSE_MOVE") {
            if (this.state === "DRAGING") {
                this.forcus();
                this.x = (evData.mouseX || 0) - this.mouseOriginX;
                this.y = (evData.mouseY || 0) - this.mouseOriginY;
            }
        } else if (ev === "MOUSE_DOWN_INSIDE") {
            if (this.option.allowDragDrop && this.state !== "DRAGING") {
                this.state = "DRAGING";
                this.mouseOriginX = evData.mouseX - this.x;
                this.mouseOriginY = evData.mouseY - this.y;
            } else {
                this.state = "NONE";
            }
        } else if (ev === "MOUSE_UP_INSIDE" || ev === "MOUSE_UP_OUTSIDE") {
            this.state = "NONE";
        }
    }
    onLeftRoom(): void {

    }
    
    // Actions
    destroy(): void {

    }
    forcus() {
        this.eRoom.forcusObject(this);
    }

    // Methods
    isCollisionPosition(x: number, y: number): boolean {
        return false;
    }
    isCollisionObject(eObject: EObject): boolean {
        // TODO: check with alternate edges for vertices
        const vertices = eObject.getVerticesPosition();
        if (vertices.length === 0) return false;
        for (const v of vertices) {
            if (this.isCollisionPosition(v.x, v.y)) return true;
        }
        return false;
    }
    getVerticesPosition(): {x: number, y: number}[] {
        return [];
    }
    isObjectInside(eObject: EObject): boolean {
        // TODO: check with alternate edges for vertices
        const vertices = eObject.getVerticesPosition();
        if (vertices.length === 0) return false;
        for (const v of vertices) {
            if (!this.isCollisionPosition(v.x, v.y)) return false;
        }
        return true;
    }
    distanceTo(eObject: EObject): number {
        return distance([this.x, this.y], [eObject.x, eObject.y]) as number;
    }
}