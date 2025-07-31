import React, { useEffect, useRef, useState } from "react";
import "./styles.scss";
import _, { isNumber } from "lodash";
import { TheoryContentSlide, QuestionContentSlide } from "../../components";
import { EduCourseProps, EduCourseReportProps } from "services/course/types";
import TableOfEduContents from "../../components/TableOfEduContents";
import ReportSlide from "../../components/ReportSlide";
import {
  createCourseReport,
  getTotalCourseReports,
  updateCourseReport,
} from "..";
import Button from "pages/course/components/Button";
import IconButton from "pages/course/components/IconButton";
import Card from "pages/course/components/Card";
import { useNavigate } from "react-router-dom";

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
  onGoToIntro?: () => void;
}
export default function Course({
  course,
  latestCourseReport,
  initialtotalCourseReports,
  initialStudyAction,
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

  const barWidths = [310, 470, 230, 400, 265];
  const initialOffsets = [-70, 45, 0, 100, -45];
  const [barOffsets, setBarOffsets] = useState(initialOffsets);
  const centerIndex = Math.floor(barWidths.length / 2);
  const barRefs = useRef([]);
  const containerRef = useRef(null);
  const [barPoints, setBarPoints] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartOffset, setDragStartOffset] = useState(0);
  const [percentage, setPercentage] = useState(24);
  const iconPaths = ["/img/home.png", "/img/option.png", "/img/flag.png"];
  const [screenStage, setScreenStage] = useState<
    "bar-chart" | "quiz" | "completed"
  >("bar-chart");
  const navigate = useNavigate();

  useEffect(() => {
    barRefs.current = barRefs.current.slice(0, barWidths.length);
  }, []);

  useEffect(() => {
    const newPoints = barRefs.current.map((ref, index) => {
      if (!ref) return null;
      const rect = ref.getBoundingClientRect();
      return {
        x: rect.left - 55,
        y: rect.top + rect.height - 55,
      };
    });

    setBarPoints(newPoints);
  }, [barOffsets]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggingIndex === null) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const dx = e.clientX - dragStartX;

      const maxOffset = containerRect.width / 2;
      const minOffset = -containerRect.width / 2;

      const newOffset = Math.min(
        Math.max(dragStartOffset + dx, minOffset),
        maxOffset
      );

      setBarOffsets((prev) => {
        const updated = [...prev];
        updated[draggingIndex] = newOffset;
        return updated;
      });
    };

    const handleMouseUp = () => {
      setDraggingIndex(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingIndex, dragStartX, dragStartOffset]);

  const handleMouseDown = (e, index) => {
    setDraggingIndex(index);
    setDragStartX(e.clientX);
    setDragStartOffset(barOffsets[index]);
  };

  useEffect(() => {
    if (barPoints.length !== barWidths.length) return;

    const centerX = barPoints[centerIndex]?.x;
    if (centerX == null) return;

    const totalDeviation = barPoints.reduce((sum, point, index) => {
      if (!point || index === centerIndex) return sum;
      return sum + Math.abs(point.x - centerX);
    }, 0);

    const MAX_DEVIATION = 800;

    let completion = 100 - (totalDeviation / MAX_DEVIATION) * 100;
    completion = Math.max(24, Math.min(100, Math.round(completion)));

    setPercentage(completion);
  }, [barPoints]);

  useEffect(() => {
    if (percentage === 100) {
      setBarOffsets((prev) =>
        prev.map((offset, index) => (index === centerIndex ? offset : 0))
      );
    }
  }, [percentage]);

  const interpolateColor = (startColor, endColor, factor) => {
    const result = startColor.map((start, i) =>
      Math.round(start + (endColor[i] - start) * factor)
    );
    return `rgb(${result.join(",")})`;
  };

  const startColor = [249, 93, 93];
  const endColor = [83, 234, 205];
  const colorFactor = (percentage - 24) / (100 - 24);
  const interpolatedColor = interpolateColor(startColor, endColor, colorFactor);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionToScreen = (next: "bar-chart" | "quiz" | "completed") => {
    setIsTransitioning(true);
    setTimeout(() => {
      setScreenStage(next);
      setIsTransitioning(false);
    }, 500);
  };

  const totalQuestions = course.contents.length;
  // const totalQuestions = course.contents.reduce(
  //   (total, content) => total + content.questions.length,
  //   0
  // );
  const progressText = `${currentEduContentIndex + 1}/${totalQuestions}`;
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null
  );

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
            <div className="screen-content">
              <div className="header-section">
                <div className="header-top">
                  <h3 className="course-title">
                    <strong>QUY TẮC ALIGN</strong>
                  </h3>
                  <div className="progress-number">{progressText}</div>
                </div>
                <div className="progress-bar">
                  {[...Array(20)].map((_, i) => {
                    const colors = [
                      "rgb(83,234,205)",
                      "rgb(83,234,205)",
                      "rgb(249,93,93)",
                      "rgb(249,93,93)",
                      "rgb(237,242,25)",
                    ];

                    const isCompleted = i < currentEduContentIndex;
                    const isCurrent = i === currentEduContentIndex;

                    const bgColor =
                      isCompleted || isCurrent
                        ? colors[i % colors.length]
                        : "rgb(198,198,198)";

                    return (
                      <div
                        key={i}
                        className={`progress-square ${
                          isCurrent ? "active" : ""
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
                        ?
                        <div className="tooltip-text">
                          Lorem ipsum dolor sit amet, consectetuer adipiscing
                          elit...
                        </div>
                      </div>
                    </>
                  ) : (
                    ""
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
        ) : screenStage === "bar-chart" ? (
          <div
            className={`fade-wrapper ${
              isTransitioning ? "fade-out" : "fade-in"
            }`}
          >
            <div className="bar-chart-container" ref={containerRef}>
              {!isTransitioning && (
                <svg className="bar-connector">
                  <polyline
                    points={
                      percentage === 100
                        ? `${barPoints[0]?.x},${barPoints[0]?.y - 20} ${
                            barPoints[barPoints.length - 1]?.x
                          },${barPoints[barPoints.length - 1]?.y + 20}`
                        : barPoints
                            .map((pt) => (pt ? `${pt.x},${pt.y}` : ""))
                            .join(" ")
                    }
                    fill="none"
                    stroke={
                      percentage === 100 ? "rgb(83,234,205)" : "rgb(2,2,2)"
                    }
                    strokeWidth={percentage === 100 ? 2 : 3}
                    strokeDasharray={percentage === 100 ? "0" : "10,15"}
                    style={{ transition: "all 0.4s ease" }}
                  />
                </svg>
              )}

              <div className="bar-chart">
                {barWidths.map((width, index) => {
                  const isCenter = index === centerIndex;
                  return (
                    <div
                      key={index}
                      className={`bar ${isCenter ? "center-bar" : ""}`}
                      ref={(el) => (barRefs.current[index] = el)}
                      style={{
                        width: `${width}px`,
                        transform: `translateX(${barOffsets[index]}px)`,
                        cursor: isCenter ? "default" : "grab",
                        transition: "transform 0.01s",
                      }}
                      onMouseDown={
                        isCenter ? undefined : (e) => handleMouseDown(e, index)
                      }
                    />
                  );
                })}
              </div>
            </div>

            <div className="completion">
              <div className="completion-content">
                <span
                  className="percentage"
                  style={{ color: interpolatedColor }}
                >
                  {percentage}%
                </span>

                {percentage === 100 ? (
                  <div className="completed-info">
                    <h3 className="completed-title">
                      <strong>QUY TẮC ALIGN</strong>
                    </h3>
                    <p className="completed-description">
                      Lorem ipsum dolor sit amet, consectetuer adipiscing
                      elit...
                    </p>
                  </div>
                ) : (
                  <span className="instruction">
                    Kéo các thanh chữ nhật để nét đứt thẳng hàng
                  </span>
                )}
              </div>

              <div className="completion-button">
                <Button
                  className={`animated-button ${
                    percentage === 100 ? "completed" : ""
                  }`}
                  iconSrc="/img/right.png"
                  text={percentage === 100 ? "Tiếp tục" : "Bỏ qua"}
                  bgColor={
                    percentage === 100 ? "rgb(83,234,205)" : "rgb(249,93,93)"
                  }
                  onClick={() => transitionToScreen("quiz")}
                />
              </div>
            </div>
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
                    <strong>{formatTimeUsed(30 * 60 - timeLeft)}</strong>
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
                  onClick={() => {
                    setCurrentEduContentIndex(0);
                    setCorrectAnswers(0);
                    transitionToScreen("bar-chart");
                  }}
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

    // <div className="course-page container-fluid row g-0 slide-in-bottom">
    //   <TableOfEduContents
    //     className="col-2"
    //     course={course}
    //     currentCourseState={currentCourseState}
    //     currentEduContentIndex={currentEduContentIndex}
    //     currentCourseReport={currentCourseReport}
    //   />
    //   <div className="detail-educontent col-10">
    //     <div className="title">
    //       {currentCourseState === "Study" ? currentEduContent.name : "KẾT QUẢ"}
    //     </div>
    //     <div className="slide-container">
    //       {currentCourseState === "Study" ? (
    //         currentStudyState === "Theory" ? (
    //           <TheoryContentSlide
    //             key={currentEduContentTheoryIndex}
    //             theory={
    //               currentEduContent.theories[currentEduContentTheoryIndex]
    //             }
    //             nextHandle={nextSlide}
    //           />
    //         ) : currentStudyState === "Question" ? (
    //           <QuestionContentSlide
    //             key={currentEduContentQuestionIndex}
    //             question={
    //               currentEduContent.questions[currentEduContentQuestionIndex]
    //             }
    //             nextHandle={nextSlide}
    //             anwseredCorrectHandle={() => {
    //               currentCourseReport.contentReports[
    //                 currentEduContentIndex
    //               ].questionsResults[currentEduContentQuestionIndex] = true;
    //               setCurrentCourseReport({ ...currentCourseReport }); // Update state
    //             }}
    //             anwseredIncorrectHandle={() => {
    //               currentCourseReport.contentReports[
    //                 currentEduContentIndex
    //               ].questionsResults[currentEduContentQuestionIndex] = false;
    //               setCurrentCourseReport({ ...currentCourseReport }); // Update state
    //             }}
    //           />
    //         ) : null
    //       ) : currentCourseState === "Report" ? (
    //         <ReportSlide
    //           course={course}
    //           courseReport={currentCourseReport}
    //           totalCourseReports={totalCourseReports}
    //           onStudyFromScratch={studyFromScratch}
    //           onStudyUnfinishContent={studyUnfinishedContent}
    //         />
    //       ) : null}
    //     </div>
    //   </div>
    // </div>
  );
}
