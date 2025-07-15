import React from "react";
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
}
export default function Course({
  course,
  latestCourseReport,
  initialtotalCourseReports,
  initialStudyAction,
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
    setCurrentStudyState("Question"); // Ẩn Theory
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
    setCurrentStudyState("Question"); // Ẩn Theory
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
    setCurrentStudyState("Question"); // Ẩn Theory
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
        // setCurrentStudyState("Theory");
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

  if (!isInitialized) return null;
  return (
    <div className="course-page container-fluid row g-0 slide-in-bottom">
      <TableOfEduContents
        className="col-2"
        course={course}
        currentCourseState={currentCourseState}
        currentEduContentIndex={currentEduContentIndex}
        currentCourseReport={currentCourseReport}
      />
      <div className="detail-educontent col-10">
        <div className="title">
          {currentCourseState === "Study" ? currentEduContent.name : "KẾT QUẢ"}
        </div>
        <div className="slide-container">
          {currentCourseState === "Study" ? (
            currentStudyState === "Theory" ? (
              {
                /* <TheoryContentSlide
                key={currentEduContentTheoryIndex}
                theory={currentEduContent.theories[currentEduContentTheoryIndex]}
                nextHandle={nextSlide}
              /> */
              }
            ) : currentStudyState === "Question" ? (
              <QuestionContentSlide
                key={currentEduContentQuestionIndex}
                question={
                  currentEduContent.questions[currentEduContentQuestionIndex]
                }
                nextHandle={nextSlide}
                anwseredCorrectHandle={() => {
                  currentCourseReport.contentReports[
                    currentEduContentIndex
                  ].questionsResults[currentEduContentQuestionIndex] = true;
                  setCurrentCourseReport({ ...currentCourseReport }); // Update state
                }}
                anwseredIncorrectHandle={() => {
                  currentCourseReport.contentReports[
                    currentEduContentIndex
                  ].questionsResults[currentEduContentQuestionIndex] = false;
                  setCurrentCourseReport({ ...currentCourseReport }); // Update state
                }}
              />
            ) : null
          ) : currentCourseState === "Report" ? (
            <ReportSlide
              course={course}
              courseReport={currentCourseReport}
              totalCourseReports={totalCourseReports}
              onStudyFromScratch={studyFromScratch}
              onStudyUnfinishContent={studyUnfinishedContent}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
