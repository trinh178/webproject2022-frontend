import * as ecanvas from "libs/ecanvas";
export default function CanvasScript(
    __canvas: HTMLCanvasElement,
    __setProgression: (value: number) => void,
    __changeText: (text: string) => void,
    __libs: { ecanvas: typeof ecanvas }
) : any {
// =========================================================================================================== \\
// ================================================== START ================================================== \\
// =========================================================================================================== \\


// Scripting..
const { CircleEObject, ERoom, RectangleEObject } = __libs.ecanvas;

// Create a room
const room = new ERoom(__canvas, { limitFps: 120 });

// Play
room.play();

// Create objects
const circle = new CircleEObject({
    radius: 50,
    fillColor: "black",
}, { allowDragDrop: true });
const rectangle = new RectangleEObject({
    width: 400,
    height: 300,
    borderColor: "grey",
    borderDashed: true,
    borderLineDash: [10, 8, 15, 9, 11, 13, 16, 14, 17, 20],
    borderWidth: 5,
}, { allowDragDrop: false });
const rectangle2 = new RectangleEObject({
    width: 100,
    height: 100,
    fillColor: "black",
}, { allowDragDrop: true });

// Add objects to the room
room.addObject(circle, 1400, 200);
room.addObject(rectangle, 300, 200);
room.addObject(rectangle2, 1300, 400);

// Events
room.onUpdate(() => {
    let progress = 0;
    if (rectangle.isObjectInside(circle) && rectangle.isObjectInside(rectangle2)) {
        progress = 100;
    } else {
        // TODO: temp
        let distance = rectangle.distanceTo(circle); distance = distance > 200 ? distance : 0;
        progress = Math.round(((1000 - distance) / 1000) * 50);
        distance = rectangle.distanceTo(rectangle2); distance = distance > 200 ? distance : 0;
        progress += Math.round(((1000 - distance) / 1000) * 50);
    }
    __setProgression(progress > 0 ? progress : 0);
    if (progress > 0 && progress < 20) __changeText("A scripting language or script language is a programming language for a runtime system that automates the execution of tasks that would otherwise be performed individually by a human");
    else if (progress > 20 && progress < 40) __changeText("Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.");
    else if (progress > 40 && progress < 60) __changeText("It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using");
    else __changeText("Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin");
});

return () => {
    room.destroy();
};


// =========================================================================================================== \\
// =================================================== END =================================================== \\
// =========================================================================================================== \\
}