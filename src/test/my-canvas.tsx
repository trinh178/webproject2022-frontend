import { useEffect, useRef } from "react"

import { ERoom, CircleEObject, RectangleEObject } from "libs/ecanvas";

export default function MyCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef?.current === null) return;

        // Create a room
        const room = new ERoom(canvasRef.current);

        // Create objects
        const circle = new CircleEObject({
            radius: 50,
            fillColor: "green",
        }, { allowDragDrop: true });
        const rectangle = new RectangleEObject({
            width: 200,
            height: 300,
        }, { allowDragDrop: true });

        // Add objects to the room
        room.addObject(circle, 100, 100);
        room.addObject(rectangle, 200, 400);

        // Play
        room.play();

    }, [canvasRef?.current]);

    return <canvas style={{
        margin: 100
    }} ref={canvasRef} width={800} height={600} className="border border-5" />
}