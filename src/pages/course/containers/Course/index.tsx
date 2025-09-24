import React, { useEffect, useRef, useState } from "react";
import "./styles.scss";
import _, { isNumber } from "lodash";
import { EduCourseProps, EduCourseReportProps } from "services/course/types";
import {
  createCourseReport,
  getTotalCourseReports,
  updateCourseReport,
} from "..";
import Button from "../../../../components/Button";
import IconButton from "components/IconButton";
import Card from "../../../../components/Card";
import AlignCanvas from "components/Canvas/AlignCanvas";
import ContrastCanvas from "components/Canvas/ContrastCanvas";
import ProximityCanvas from "components/Canvas/ProximityCanvas";
import RepetitionCanvas from "components/Canvas/RepetitionCanvas";

export type CourseStateType = "Study" | "Report";
export type StudyStateType = "Theory" | "Question";
export type StudyAction =
  | "STUDY_FROM_SCRATCH"
  | "CONTINUE_STUDY"
  | "STUDY_UNFINISHED_CONTENTS";
interface CourseProps {
  course: EduCourseProps;
  latestCourseReport: EduCourseReportProps;
  initialtotalCourseReports: number;
  initialStudyAction: StudyAction;
  selectedRule: "align" | "proximity" | "repetition" | "contrast" | null;
  onGoToIntro?: () => void;
}
export default function Course({
  course,
  latestCourseReport,
  initialtotalCourseReports,
  initialStudyAction,
  selectedRule,
  onGoToIntro,
}: CourseProps) {
  // Validation
  if (!course) return null;
  if (
    !initialStudyAction ||
    (initialStudyAction === "CONTINUE_STUDY" && !latestCourseReport)
  )
    return null;
  if (!isNumber(initialtotalCourseReports) && initialtotalCourseReports < 0)
    return null;

  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);

  const [currentCourseState, setCurrentCourseState] =
    React.useState<CourseStateType>("Study");
  const [currentStudyState, setCurrentStudyState] =
    React.useState<StudyStateType>("Theory");
  const [currentEduContentTheoryIndex, setCurrentEduContentTheoryIndex] =
    React.useState<number>(0);
  const [currentEduContentQuestionIndex, setCurrentEduContentQuestionIndex] =
    React.useState<number>(0);

  const [totalCourseReports, setTotalCourseReports] = React.useState<number>(
    initialtotalCourseReports
  );
  const [previousCourseReport, setPreviousCourseReport] =
    React.useState<EduCourseReportProps>(latestCourseReport);
  const [currentCourseReport, setCurrentCourseReport] =
    React.useState<EduCourseReportProps>(null);

  const [currentEduContentIndex, setCurrentEduContentIndex] =
    React.useState<number>(0);

  const currentEduContent = course.contents[currentEduContentIndex];

  const studyContinue = () => {
    setPreviousCourseReport(latestCourseReport);
    setCurrentCourseState("Study");
    setCurrentStudyState("Theory");
    setCurrentEduContentTheoryIndex(0);
    setCurrentEduContentQuestionIndex(0);

    // Start study status for content
    const cur =
      latestCourseReport || createCourseReport("STUDY_FROM_SCRATCH", course);
    const i = cur.contentReports.findIndex(
      (cr) => cr.studyStatus === "STUDYING"
    );
    cur.contentReports[i].studyStatus = "STUDYING";
    setCurrentCourseReport(cur);
    setCurrentEduContentIndex(i);
  };
  const studyFromScratch = () => {
    setPreviousCourseReport(currentCourseReport);
    setCurrentCourseState("Study");
    setCurrentStudyState("Theory");
    setCurrentEduContentTheoryIndex(0);
    setCurrentEduContentQuestionIndex(0);

    // Start study status for content
    const cur = createCourseReport("STUDY_FROM_SCRATCH", course);
    const i = cur.contentReports.findIndex(
      (cr) => cr.studyStatus === "NOT_STARTED"
    );
    cur.contentReports[i].studyStatus = "STUDYING";
    setCurrentCourseReport(cur);
    setCurrentEduContentIndex(i);
  };
  const studyUnfinishedContent = () => {
    setPreviousCourseReport(currentCourseReport);
    setCurrentCourseState("Study");
    setCurrentStudyState("Theory");
    setCurrentEduContentTheoryIndex(0);
    setCurrentEduContentQuestionIndex(0);

    // Start study status for content
    const cur = createCourseReport("STUDY_UNFINISHED_CONTENTS", course);
    const i = cur.contentReports.findIndex(
      (cr) => cr.studyStatus === "NOT_STARTED"
    );
    cur.contentReports[i].studyStatus = "STUDYING";
    setCurrentCourseReport(cur);
    setCurrentEduContentIndex(i);
  };

  const nextContent = () => {
    // Finish study status for content
    currentCourseReport.contentReports[currentEduContentIndex].studyStatus =
      currentCourseReport.contentReports[
        currentEduContentIndex
      ].questionsResults.includes(false)
        ? "STUDIED_UNFINISHED"
        : "STUDIED_FININSHED";

    let i = currentEduContentIndex + 1;
    for (; i < course.contents.length; i++) {
      if (currentCourseReport.contentReports[i].studyStatus === "NOT_STARTED")
        break;
    }
    if (i === course.contents.length) {
      // Finish study status for course
      currentCourseReport.studyStatus =
        currentCourseReport.contentReports.filter(
          (cr) => cr.studyStatus !== "STUDIED_FININSHED"
        ).length !== 0
          ? "STUDIED_UNFINISHED"
          : "STUDIED_FININSHED";
      setCurrentCourseReport({ ...currentCourseReport }); // Update state
      setCurrentCourseState("Report");
      return;
    }

    // Start study status for content
    currentCourseReport.contentReports[i].studyStatus = "STUDYING";
    setCurrentCourseReport({ ...currentCourseReport }); // Update state

    setCurrentEduContentIndex(i);
  };

  const nextSlide = () => {
    if (currentStudyState === "Theory") {
      if (
        currentEduContentTheoryIndex + 1 <
        currentEduContent.theories.length
      ) {
        setCurrentEduContentTheoryIndex(currentEduContentTheoryIndex + 1);
      } else {
        setCurrentEduContentQuestionIndex(0);
        setCurrentStudyState("Question");
      }
    } else if (currentStudyState === "Question") {
      if (
        currentEduContentQuestionIndex + 1 <
        currentEduContent.questions.length
      ) {
        setCurrentEduContentQuestionIndex(currentEduContentQuestionIndex + 1);
      } else {
        setCurrentEduContentTheoryIndex(0);
        setCurrentStudyState("Theory");
        nextContent();
      }
    }
  };

  React.useEffect(() => {
    if (!isInitialized) return;

    if (currentCourseState === "Report") {
      setTotalCourseReports(getTotalCourseReports());
    }
  }, [isInitialized, currentStudyState]);

  React.useEffect(() => {
    if (!isInitialized) return;

    updateCourseReport(currentCourseReport);
  }, [isInitialized, currentCourseReport]);

  // Initialization
  React.useEffect(() => {
    if (initialStudyAction === "CONTINUE_STUDY") {
      studyContinue();
    } else if (initialStudyAction === "STUDY_FROM_SCRATCH") {
      studyFromScratch();
    } else if (initialStudyAction === "STUDY_UNFINISHED_CONTENTS") {
      studyUnfinishedContent();
    }
    setIsInitialized(true);
  }, []);

  const iconPaths = ["/img/home.png", "/img/option.png", "/img/flag.png"];
  const [screenStage, setScreenStage] = useState<
    "canvas" | "quiz" | "completed"
  >("canvas");

  const [showQuizIntro, setShowQuizIntro] = useState(false);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [totalSteps, setTotalSteps] = useState(
    window.innerWidth <= 480 ? 12 : 20
  );
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setTotalSteps(window.innerWidth <= 480 ? 12 : 20);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const transitionToScreen = (next: "canvas" | "quiz" | "completed") => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (next === "quiz") {
        setShowQuizIntro(true);
      }
      setScreenStage(next);
      setIsTransitioning(false);
    }, 500);
  };

  const totalQuestions = course.contents.length;
  const [currentBatch, setCurrentBatch] = useState(0);
  const batchStartIndex = currentBatch * totalSteps;
  // const totalQuestions = course.contents.reduce(
  //   (total, content) => total + content.questions.length,
  //   0
  // );
  const progressText = `${currentEduContentIndex + 1}/${totalQuestions}`;
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null
  );
  const [answersHistory, setAnswersHistory] = useState<boolean[]>([]);

  useEffect(() => {
    if (screenStage === "completed") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [screenStage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `00:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatTimeUsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const [isCompareMode, setIsCompareMode] = useState(false);

  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (
      !currentEduContent ||
      !currentEduContent.questions ||
      !currentEduContent.questions[currentEduContentQuestionIndex]
    )
      return;

    setAnswers(
      _.shuffle([
        {
          isCorrect: true,
          answer:
            currentEduContent.questions[currentEduContentQuestionIndex]
              .correctAnswer,
        },
        {
          isCorrect: false,
          answer:
            currentEduContent.questions[currentEduContentQuestionIndex]
              .incorrectAnswer,
        },
      ])
    );
  }, [currentEduContentIndex, currentEduContentQuestionIndex]);

  const handleNextQuestion = () => {
    const isCorrectAnswer = answers[selectedCardIndex]?.isCorrect ?? false;

    setAnswersHistory((prev) => {
      const newHistory = [...prev];
      newHistory[currentEduContentIndex] = isCorrectAnswer;
      return newHistory;
    });

    if (answers[selectedCardIndex]?.isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }

    setSelectedCardIndex(null);
    setIsCompareMode(false);

    const nextIndex = currentEduContentIndex + 1;

    if (nextIndex >= totalQuestions) {
      transitionToScreen("completed");
      return;
    }

    setCurrentEduContentIndex(nextIndex);

    if (nextIndex >= batchStartIndex + totalSteps) {
      setCurrentBatch((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentEduContentIndex(0);
    setCurrentBatch(0);
    setAnswersHistory([]);
    setSelectedCardIndex(null);
    setIsCompareMode(false);
    setCorrectAnswers(0);
    setTimeLeft(20 * 60);
    transitionToScreen("quiz");
  };

  if (!isInitialized) return null;

  return (
    <div className="course-page">
      <div className="logo">
        <span className="logo-part">GRA</span>
        <span className="logo-part">EDU</span>
      </div>
      <div className="course-container">
        {screenStage === "quiz" ? (
          <div
            className={`next-screen ${
              isTransitioning ? "fade-out" : "fade-in"
            }`}
          >
            {showQuizIntro && (
              <div className="popup-overlay">
                <div className="popup-content">
                  <h3>Chọn đáp án đúng với quy tắc Align</h3>
                  <Button
                    className=""
                    iconSrc="/img/right.png"
                    text="Bắt đầu"
                    bgColor="rgb(83,234,205)"
                    onClick={() => {
                      setShowQuizIntro(false);
                      setTimeLeft(20 * 60);
                    }}
                  />
                </div>
              </div>
            )}

            <div className="screen-content">
              <div className="header-section">
                <div className="header-top">
                  <h3 className="course-title">
                    <strong>QUY TẮC ALIGN</strong>
                  </h3>
                  <div className="progress-number">{progressText}</div>
                </div>
                <div className="progress-bar">
                  {Array.from({
                    length: Math.min(
                      totalSteps,
                      totalQuestions - batchStartIndex
                    ),
                  }).map((_, i) => {
                    const questionIndex = batchStartIndex + i;

                    let bgColor = "rgb(198,198,198)";

                    if (questionIndex < currentEduContentIndex) {
                      bgColor =
                        answersHistory[questionIndex] === true
                          ? "rgb(83,234,205)"
                          : "rgb(249,93,93)";
                    }

                    if (questionIndex === currentEduContentIndex) {
                      bgColor = "rgb(237,242,25)";
                    }

                    return (
                      <div
                        key={i}
                        className={`progress-square ${
                          questionIndex === currentEduContentIndex
                            ? "active"
                            : ""
                        }`}
                        style={{ backgroundColor: bgColor }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="instruction-section">
                <span className="instruction">
                  {selectedCardIndex === null ? (
                    "Chọn ảnh có các thành phần được sắp xếp gọn nhất"
                  ) : !answers[selectedCardIndex].isCorrect ? (
                    <>
                      Lỗi quy tắc Align
                      <div className="icon-box tooltip-container">
                        <img
                          src="/img/more-infor.png"
                          alt="More info"
                          className="more-info-icon"
                        />
                        <div className="tooltip-text">
                          {currentEduContent?.theories?.[0]?.initialText ||
                            "Chưa có lý thuyết cho nội dung này"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      Lý thuyết
                      <div className="icon-box tooltip-container">
                        <img
                          src="/img/more-infor.png"
                          alt="More info"
                          className="more-info-icon"
                        />
                        <div className="tooltip-text">
                          {currentEduContent?.theories?.[0]?.initialText ||
                            "Chưa có lý thuyết cho nội dung này"}
                        </div>
                      </div>
                    </>
                  )}
                </span>

                <div className="card-container">
                  {answers.map((item, i) => (
                    <Card
                      key={`card-${currentEduContentIndex}-${i}`}
                      index={i}
                      imageUrl={item.answer.imgUrl}
                      isSelected={selectedCardIndex === i}
                      selectedCardIndex={selectedCardIndex}
                      onSelect={(i) => setSelectedCardIndex(i)}
                      isCorrect={item.isCorrect}
                      isCompareMode={isCompareMode}
                    />
                  ))}
                </div>

                <div
                  className={`action-buttons ${
                    selectedCardIndex !== null ? "show" : ""
                  }`}
                >
                  <Button
                    className=""
                    iconSrc="/img/compare.png"
                    text="So sánh"
                    bgColor="rgb(237,242,25)"
                    onMouseDown={() => setIsCompareMode(true)}
                    onMouseUp={() => setIsCompareMode(false)}
                    onMouseLeave={() => setIsCompareMode(false)}
                    onTouchStart={() => setIsCompareMode(true)}
                    onTouchEnd={() => setIsCompareMode(false)}
                  />
                  <Button
                    className=""
                    iconSrc="/img/right.png"
                    text="Tiếp tục"
                    bgColor="rgb(83,234,205)"
                    onClick={handleNextQuestion}
                  />
                </div>
              </div>
            </div>

            <div className="timer-container">
              <img
                src="/img/stopwatch.png"
                alt="Timer Icon"
                className="timer-icon"
              />
              <div className="timer">{formatTime(timeLeft)}</div>
            </div>
          </div>
        ) : screenStage === "canvas" ? (
          <div
            className={`fade-wrapper ${
              isTransitioning ? "fade-out" : "fade-in"
            }`}
          >
            {selectedRule === "align" && (
              <AlignCanvas onContinue={() => transitionToScreen("quiz")} />
            )}
            {selectedRule === "contrast" && (
              <ContrastCanvas onContinue={() => transitionToScreen("quiz")} />
            )}
            {selectedRule === "proximity" && (
              <ProximityCanvas onContinue={() => transitionToScreen("quiz")} />
            )}
            {selectedRule === "repetition" && (
              <RepetitionCanvas onContinue={() => transitionToScreen("quiz")} />
            )}
          </div>
        ) : (
          <div
            className={`report-screen ${
              isTransitioning ? "fade-out" : "fade-in"
            }`}
          >
            <div className="report-container">
              <div className="report-icon">
                <div className="report-icon">
                  <img
                    src="/img/star-left.png"
                    alt="star-left"
                    className="star-shifted star-left"
                  />

                  <div className="star-circle">
                    <img
                      src="/img/star.png"
                      alt="star"
                      className="star-center"
                    />
                  </div>

                  <img
                    src="/img/star-right.png"
                    alt="star-right"
                    className="star-shifted star-right"
                  />
                </div>
              </div>

              <h2 className="report-title">
                <strong>CHÚC MỪNG! Bạn đúng là Designer thực thụ!</strong>
              </h2>

              <div className="report-stats">
                <div className="stat-block">
                  <div className="stat-label">Thời gian</div>
                  <div className="stat-value">
                    <strong>{formatTimeUsed(20 * 60 - timeLeft)}</strong>
                  </div>
                </div>
                <div className="stat-block">
                  <div className="stat-label">Tỉ lệ đúng</div>
                  <div className="stat-value">
                    <strong>
                      {correctAnswers}/{totalQuestions} (
                      {Math.round((correctAnswers / totalQuestions) * 100)}%)
                    </strong>
                  </div>
                </div>
              </div>

              <div className="report-buttons">
                <Button
                  className=""
                  iconSrc="/img/retry.png"
                  text="Chơi lại"
                  bgColor="#FFF44F"
                  onClick={handleRestart}
                />
                <Button
                  className=""
                  iconSrc="/img/right.png"
                  text="Tiếp tục"
                  bgColor="#50F5DC"
                  onClick={onGoToIntro}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="course-icons">
        <IconButton icons={iconPaths} />
      </div>
    </div>
  );
}
