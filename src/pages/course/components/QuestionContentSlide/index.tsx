import React from "react";
import "./styles.scss";
import classNames from "classnames";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { EduContentQuestionProps } from "services/course/types";
import AspectRadioWrapper from "shared/components/AspectRadioWrapper";

interface QuestionContentSlideProps {
  question: EduContentQuestionProps;
  nextHandle: () => void;
}

export default function QuestionContentSlide({
  question,
  nextHandle,
}: QuestionContentSlideProps) {
  const [isAnswered, setIsAnswered] = React.useState<boolean>(false);
  const [answeredIndex, setAnsweredIndex] = React.useState<number>(-1);

  const answers = React.useRef(
    _.shuffle([
      {
        isCorrect: true,
        answer: question.correctAnswer,
      },
      {
        isCorrect: false,
        answer: question.incorrectAnswer,
      },
    ])
  );

  return (
    <div className="question-content-slide slide-in-bottom">
      <div className="question row g-0">
        <div className="col-12 text-center title">
          Select the design that is most correct
        </div>
        <div className="col-5 offset-1">
          <div className="w-100 pe-5 ps-5 mt-5">
            <AspectRadioWrapper
              aspectRadio={{
                width: 3,
                height: 2,
              }}
            >
              <div
                className="answer"
                onClick={() => {
                  if (isAnswered) return;
                  setIsAnswered(true);
                  setAnsweredIndex(0);
                }}
              >
                <img src={answers.current[0].answer.imgUrl} />
                {isAnswered && answeredIndex === 0 ? (
                  <FontAwesomeIcon
                    className={
                      answers.current[0].isCorrect ? "correct scale-up-center" : "incorrect scale-up-center"
                    }
                    icon={
                      answers.current[0].isCorrect
                        ? faCircleCheck
                        : faCircleXmark
                    }
                  />
                ) : null}
              </div>
            </AspectRadioWrapper>
          </div>
        </div>
        <div className="col-5">
          <div className="w-100 ps-5 pe-5 mt-5">
            <AspectRadioWrapper
              aspectRadio={{
                width: 3,
                height: 2,
              }}
            >
              <div
                className="answer"
                onClick={() => {
                  if (isAnswered) return;
                  setIsAnswered(true);
                  setAnsweredIndex(1);
                }}
              >
                <img src={answers.current[1].answer.imgUrl} />
                {isAnswered && answeredIndex === 1 ? (
                  <FontAwesomeIcon
                    className={
                      answers.current[1].isCorrect ? "correct scale-up-center" : "incorrect scale-up-center"
                    }
                    icon={
                      answers.current[1].isCorrect
                        ? faCircleCheck
                        : faCircleXmark
                    }
                  />
                ) : null}
              </div>
            </AspectRadioWrapper>
          </div>
        </div>
      </div>
      <span
        className={classNames("next-btn", "mt-5", { "slide-out-bottom": !isAnswered, "slide-in-bottom": isAnswered })}
        onClick={() => nextHandle()}
      >
        Tiếp theo
      </span>
    </div>
  );
}
