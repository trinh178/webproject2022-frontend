import { EObjectOption } from './types';
import { distance } from 'mathjs';
import { EObject } from './eobject';

interface CircleOption {
    radius: number,
    fillColor?: string,
    borderColor?: string,
    borderDashed?: boolean,
    borderWidth?: number,
    borderLineDash?: number[],
} 

export class CircleEObject extends EObject {
    circleOption: CircleOption;

    constructor(circleOption: CircleOption, option?: EObjectOption) {
        super(option);
        this.circleOption = circleOption;
    }

    onDraw(ctx: CanvasRenderingContext2D): void {
        super.onDraw(ctx);

        // Reset
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.circleOption.radius, 0, 2*Math.PI);

        if (this.circleOption.fillColor) {
            ctx.fillStyle = this.circleOption.fillColor;
            ctx.fill();
        }

        if (this.circleOption.borderColor) {
            ctx.strokeStyle = this.circleOption.borderColor;
            if (this.circleOption.borderDashed) {
                ctx.setLineDash(this.circleOption.borderLineDash || [10]);
            }
            ctx.lineWidth = this.circleOption.borderWidth || 2;
            ctx.stroke();
        }
    }

    // Methods
    isCollisionPosition(x: number, y: number): boolean {
        return distance([this.x, this.y], [x, y]) <= this.circleOption.radius;
    }
    getVerticesPosition(): { x: number; y: number; }[] {
        // TODO: re-calc array points
        const topLeft = {
            x: this.x - this.circleOption.radius,
            y: this.y - this.circleOption.radius,
        }
        const topRight = {
            x: topLeft.x + this.circleOption.radius * 2,
            y: topLeft.y,
        }
        const bottomLeft = {
            x: topLeft.x,
            y: topLeft.y + this.circleOption.radius * 2,
        }
        const bottomRight = {
            x: topRight.x,
            y: bottomLeft.y,
        }
        return [ topLeft, topRight, bottomLeft, bottomRight ];
    }
}