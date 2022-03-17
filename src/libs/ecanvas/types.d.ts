export interface ERoomOption {
    limitFps?: number
}
export type EEventType = "MOUSE_DOWN_INSIDE" | "MOUSE_DOWN_OUTSIDE" | "MOUSE_UP_INSIDE" | "MOUSE_UP_OUTSIDE" | "MOUSE_MOVE";
export interface EEventData {
    mouseX?: number,
    mouseY?: number,
}
export interface EObjectOption {
    allowDragDrop?: boolean,
}
export type EObjectState = "NONE" | "DRAGING";