import { EObjectOption } from './types';
import { EObject } from "./eobject";

interface RectangleOption {
    width: number,
    height: number,
    fillColor?: string,
    borderColor?: string,
    borderDashed?: boolean,
    borderWidth?: number,
    borderLineDash?: number[],
} 

export class RectangleEObject extends EObject {
    rectOption: RectangleOption;

    constructor(rectOption: RectangleOption, option?: EObjectOption) {
        super(option);
        this.rectOption = rectOption;
    }

    onDraw(ctx: CanvasRenderingContext2D): void {
        super.onDraw(ctx);

        // Reset
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.rect(this.x - this.rectOption.width / 2, this.y - this.rectOption.height / 2, this.rectOption.width, this.rectOption.height);

        if (this.rectOption.fillColor) {
            ctx.fillStyle = this.rectOption.fillColor;
            ctx.fill();
        }

        if (this.rectOption.borderColor) {
            ctx.strokeStyle = this.rectOption.borderColor;
            if (this.rectOption.borderDashed) {
                ctx.setLineDash(this.rectOption.borderLineDash || [10]);
            }
            ctx.lineWidth = this.rectOption.borderWidth || 2;
            ctx.stroke();
        }
    }

    // Methods
    isCollisionPosition(x: number, y: number): boolean {
        return (x >= this.x - this.rectOption.width / 2 && x < this.x + this.rectOption.width / 2) &&
        (y >= this.y - this.rectOption.height / 2 && y < this.y + this.rectOption.height / 2);
    }
    getVerticesPosition(): { x: number; y: number; }[] {
        const topLeft = {
            x: this.x - this.rectOption.width / 2,
            y: this.y - this.rectOption.height / 2,
        }
        const topRight = {
            x: topLeft.x + this.rectOption.width,
            y: topLeft.y,
        }
        const bottomLeft = {
            x: topLeft.x,
            y: topLeft.y + this.rectOption.height,
        }
        const bottomRight = {
            x: topRight.x,
            y: bottomLeft.y,
        }
        return [ topLeft, topRight, bottomLeft, bottomRight ];
    }
}