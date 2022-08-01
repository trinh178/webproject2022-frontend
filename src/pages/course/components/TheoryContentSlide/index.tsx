import React from "react";
import "./styles.scss";
import classNames from "classnames";
import * as ecanvas from "libs/ecanvas";
import { EduContentTheoryProps } from "services/course/types";
import TextTransition from "react-text-transition";
import AspectRadioWrapper from "shared/components/AspectRadioWrapper";

const ANIMATION_ASPECT_RATIO = 1600 / 500;

interface TheoryContentSlideProps {
  theory: EduContentTheoryProps;
  nextHandle: () => void;
}

export default function TheoryContentSlide({
  theory,
  nextHandle,
}: TheoryContentSlideProps) {
  const animationContainerRef = React.useRef<HTMLDivElement>(null);

  // Progression, text and next button
  const [progress, setProgress] = React.useState<number>(0);
  const [text, setText] = React.useState<string>(theory.initialText);
  const changeText = (t: string) => {
    if (t === text) return;
    setText(t);
  };
  const [showNextBtn, setShowNextBtn] = React.useState<boolean>(false);
  const setProgression = (progess: number) => {
    setProgress(progess);
    if (progess >= 100) setShowNextBtn(true);
    else setShowNextBtn(false);
  };
  const [animationScriptError, setAnimationScriptError] = React.useState<string>("");

  // Side effects
  React.useEffect(() => {
    let animationClear: () => void;
    try {
      const animationRunner = new Function(
        "__container",
        "__containerAspectRatio",
        "__setProgression",
        "__changeText",
        "__libs",
        theory.animationScript
      );
      animationClear = animationRunner(
        animationContainerRef.current,
        ANIMATION_ASPECT_RATIO,
        setProgression,
        changeText,
        { ecanvas }
      );
    } catch (e) {
      setAnimationScriptError(e.message || "");
      console.error(e);
    }
    return () => {
      try {
        animationClear?.();
      } catch (e) {
        setAnimationScriptError(e.message || "");
        console.error(e);
      }
    };
  }, [theory]);

  return (
    <div className="theory-content-slide slide-in-bottom">
      {
        <div className="theory">
          <AspectRadioWrapper aspectRadio={ANIMATION_ASPECT_RATIO}>
              <div className="edu-animation-container" ref={animationContainerRef}>
                {animationScriptError && (
                  <div className="error">
                    Error animation script
                    <p>{animationScriptError}</p>
                  </div>
                )}
              </div>
            </AspectRadioWrapper>
          <div className="desc row">
            <div className="edu-text col-10">
              <TextTransition text={text} />
            </div>
            <div className="progression col-2">{progress}</div>
          </div>
        </div>
      }
      <span
        className={classNames("next-btn", { "slide-out-bottom": !showNextBtn, "slide-in-bottom": showNextBtn })}
        onClick={() => nextHandle()}
      >
        Tiếp theo
      </span>
    </div>
  );
}
