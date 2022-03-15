export function convertWindowPostionToCanvasPosition(canvas: HTMLCanvasElement, {x, y}: {x: number, y: number}) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (x - rect.left) * scaleX,
        y: (y - rect.top) * scaleY,
    }
}