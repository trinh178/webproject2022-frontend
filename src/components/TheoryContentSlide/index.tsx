import React from "react";
import "./styles.scss";
import classNames from "classnames";
import * as ecanvas from "libs/ecanvas";
import TextTransition from "react-text-transition";
import CanvasScript from "demo/canvas-script";

export interface EduContentTheoryProps {
    text: string,
    canvasScript: string,
}

interface TheoryContentSlideProps {
    theory: EduContentTheoryProps,
    nextHandle: () => void,
}

export default function TheoryContentSlide({ theory, nextHandle }: TheoryContentSlideProps) {
    const canvasContainerRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    // Progression, text and next button
    const [progress, setProgress] = React.useState<number>(0);
    const [text, setText] = React.useState<string>(theory.text);
    const changeText = (t: string) => {
        if (t === text) return;
        setText(t);
    }
    const [showNextBtn, setShowNextBtn] = React.useState<boolean>(false);
    const setProgression = (progess: number) => {
        setProgress(progess);
        if (progess === 100) setShowNextBtn(true)
        else setShowNextBtn(false);
    }
    const [canvasScriptError, setCanvasScriptError] = React.useState<string>("");

    // Side effects
    React.useEffect(() => {
        let canvasClear: () => void;
        try {
            const canvasRunner = CanvasScript;
            canvasClear = canvasRunner(canvasRef.current, setProgression, changeText, { ecanvas });
        } catch (e) {
            setCanvasScriptError(e.message || "");
            console.error(e);
        }
        return () => {
            try {
                canvasClear();
            } catch (e) {
                setCanvasScriptError(e.message || "");
                console.error(e);
            }
        }
    }, [theory]);


    return (
        <div className="theory-content-slide">
            {
                <div className="theory">
                    <div className="edu-animation" ref={canvasContainerRef}>
                        <div className="aspect-ratio-container-wrapper">
                            <div className="aspect-ratio-container">
                                <canvas ref={canvasRef} width={1600} height={500} />
                                {canvasScriptError && <div className="canvas-error">Error canvas script
                                    <p>{canvasScriptError}</p>
                                </div>}
                            </div>
                        </div>
                    </div>
                    <div className="desc row">
                        <div className="edu-text col-10"><TextTransition text={text} /></div>
                        <div className="progression col-2">{progress}</div>
                    </div>
                </div>
            }
            <span className={classNames("next-btn", {"d-none": !showNextBtn})} onClick={() => nextHandle()}>Tiếp theo</span>
        </div>
    );
}