import React, { useEffect } from "react";
import "./styles.scss";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import _, { isNumber } from "lodash";
import { TheoryContentSlide, QuestionContentSlide } from "./components";
import * as courseService from "services/course";
import { EduContentReportProps, EduCourseProps, EduCourseReportProps, EduReportType } from "services/course/types";
import CourseIntro from "./components/CourseIntro";
import TableOfEduContents from "./components/TableOfEduContents";
import ReportSlide from "./components/ReportSlide";
import SamuiSlideProvider, { SamuiSlideComponentProps } from "shared/components/SamuiSlideProvider";
import { useAsync, useAsyncFn } from "react-use";

let testId = 1;
function getTotalCourseReports(): number {
    return Number.parseInt(localStorage.getItem("__totalCourseReports")) || 0;
}
function getCourseReportByLatest(): EduCourseReportProps {
    const latestCourseReport = JSON.parse(localStorage.getItem("__latestCourseReport")) as EduCourseReportProps;
    return latestCourseReport;
}
function updateCourseReport(courseReport: EduCourseReportProps) {
    // update by id if server
    localStorage.setItem("__latestCourseReport", JSON.stringify(courseReport));
}
function createCourseReport(
    type: EduReportType,
    course: EduCourseProps): EduCourseReportProps {
    const latestCourseReport = getCourseReportByLatest();
    if (latestCourseReport?.studyStatus === 'NOT_STARTED') {
        //alert('error');
        return latestCourseReport; // TODO
    }

    let cr: EduCourseReportProps;
    if (type === 'STUDY_FROM_SCRATCH') {
        cr = {
            id: (testId++).toString(),
            contentReports: course.contents.map(c => ({
                questionsResults: c.questions.map(q => false),
                studyStatus: 'NOT_STARTED',
            })),
            studyStatus: 'NOT_STARTED',
            reportType: type,
        };
    } else if (type === 'STUDY_UNFINISHED_CONTENTS') {
        if (!latestCourseReport) alert("error latestCourseReport");
        cr = {
            id: (testId++).toString(),
            contentReports: latestCourseReport.contentReports.map(c => ({
                questionsResults: c.questionsResults.map(q => c.studyStatus === 'STUDIED_UNFINISHED' ? false : q),
                studyStatus: c.studyStatus === 'STUDIED_UNFINISHED' ? 'NOT_STARTED' : c.studyStatus,
            })),
            studyStatus: 'NOT_STARTED',
            reportType: type,
        };
    }
    localStorage.setItem("__latestCourseReport", JSON.stringify(cr));
    localStorage.setItem("__totalCourseReports", ((Number.parseInt(localStorage.getItem("__totalCourseReports"))  || 0) + 1).toString());
    return cr;
}

export type CourseStateType = "Study" | "Report";
export type StudyStateType = "Theory" | "Question";
export type StudyAction = "STUDY_FROM_SCRATCH" | "CONTINUE_STUDY" | "STUDY_UNFINISHED_CONTENT";
interface CoursePageProps {
    course: EduCourseProps;
    latestCourseReport: EduCourseReportProps;
    initialtotalCourseReports: number;
    initialStudyAction: StudyAction;
}
function Page({ course, latestCourseReport, initialtotalCourseReports, initialStudyAction }: CoursePageProps) {
    // Validation
    if (!course) return null;
    if (!initialStudyAction || (initialStudyAction === 'CONTINUE_STUDY' && !latestCourseReport)) return null;
    if (!isNumber(initialtotalCourseReports) && initialtotalCourseReports < 0) return null;

    const [isInitialized, setIsInitialized] = React.useState<boolean>(false);

    const [currentCourseState, setCurrentCourseState] = React.useState<CourseStateType>("Study");
    const [currentStudyState, setCurrentStudyState] = React.useState<StudyStateType>("Theory");
    const [currentEduContentTheoryIndex, setCurrentEduContentTheoryIndex] = React.useState<number>(0);
    const [currentEduContentQuestionIndex, setCurrentEduContentQuestionIndex] = React.useState<number>(0);

    const [totalCourseReports, setTotalCourseReports] = React.useState<number>(initialtotalCourseReports);
    const [previousCourseReport, setPreviousCourseReport] = React.useState<EduCourseReportProps>(latestCourseReport);
    const [currentCourseReport, setCurrentCourseReport] = React.useState<EduCourseReportProps>(null);

    const [currentEduContentIndex, setCurrentEduContentIndex] = React.useState<number>(0);

    const currentEduContent = course.contents[currentEduContentIndex];

    const studyContinue = () => {
        setPreviousCourseReport(latestCourseReport);
        setCurrentCourseState("Study");
        setCurrentStudyState("Theory");
        setCurrentEduContentTheoryIndex(0);
        setCurrentEduContentQuestionIndex(0);

        // Start study status for content
        const cur = latestCourseReport || createCourseReport('STUDY_FROM_SCRATCH', course);
        const i = cur.contentReports.findIndex(cr => cr.studyStatus === 'STUDYING');
        cur.contentReports[i].studyStatus = 'STUDYING';
        setCurrentCourseReport(cur);
        setCurrentEduContentIndex(i);
    }
    const studyFromScratch = () => {
        setPreviousCourseReport(currentCourseReport);
        setCurrentCourseState("Study");
        setCurrentStudyState("Theory");
        setCurrentEduContentTheoryIndex(0);
        setCurrentEduContentQuestionIndex(0);

        // Start study status for content
        const cur = createCourseReport('STUDY_FROM_SCRATCH', course);
        const i = cur.contentReports.findIndex(cr => cr.studyStatus === 'NOT_STARTED');
        cur.contentReports[i].studyStatus = 'STUDYING';
        setCurrentCourseReport(cur);
        setCurrentEduContentIndex(i);
    }
    const studyUnfinishedContent = () => {
        setPreviousCourseReport(currentCourseReport);
        setCurrentCourseState("Study");
        setCurrentStudyState("Theory");
        setCurrentEduContentTheoryIndex(0);
        setCurrentEduContentQuestionIndex(0);

        // Start study status for content
        const cur = createCourseReport('STUDY_UNFINISHED_CONTENTS', course);
        const i = cur.contentReports.findIndex(cr => cr.studyStatus === 'NOT_STARTED');
        cur.contentReports[i].studyStatus = 'STUDYING';
        setCurrentCourseReport(cur);
        setCurrentEduContentIndex(i);
    };

    const nextContent = () => {
        // Finish study status for content
        currentCourseReport.contentReports[currentEduContentIndex].studyStatus
                = currentCourseReport.contentReports[currentEduContentIndex].questionsResults.includes(false)
                    ? 'STUDIED_UNFINISHED'
                    : 'STUDIED_FININSHED';

        let i = currentEduContentIndex + 1;
        for (; i < course.contents.length; i++) {
            if (currentCourseReport.contentReports[i].studyStatus === 'NOT_STARTED') break;
        }
        if (i === course.contents.length) {
            // Finish study status for course
            currentCourseReport.studyStatus
                = currentCourseReport.contentReports.filter(cr => cr.studyStatus !== 'STUDIED_FININSHED').length !== 0
                    ? 'STUDIED_UNFINISHED'
                    : 'STUDIED_FININSHED';
            setCurrentCourseReport({...currentCourseReport}); // Update state
            setCurrentCourseState("Report");
            return;
        }

        // Start study status for content
        currentCourseReport.contentReports[i].studyStatus = 'STUDYING';
        setCurrentCourseReport({...currentCourseReport});  // Update state

        setCurrentEduContentIndex(i);
    };

    const nextSlide = () => {
        if (currentStudyState === "Theory") {
            if (currentEduContentTheoryIndex + 1 < currentEduContent.theories.length) {
                setCurrentEduContentTheoryIndex(currentEduContentTheoryIndex + 1);
            } else {
                setCurrentEduContentQuestionIndex(0);
                setCurrentStudyState("Question");
            }
        } else if (currentStudyState === "Question") {
            if (currentEduContentQuestionIndex + 1 < currentEduContent.questions.length) {
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

        if (currentCourseState === 'Study') {
            // Start study status for course
            currentCourseReport.studyStatus = 'STUDYING';
            setCurrentCourseReport({...currentCourseReport});  // Update state
        } else if (currentCourseState === 'Report') {
            setTotalCourseReports(getTotalCourseReports());
        }
    }, [currentStudyState]);

    React.useEffect(() => {
        if (!isInitialized) return;

        updateCourseReport(currentCourseReport);
    }, [currentCourseReport]);

    // Initialization
    React.useEffect(() => {
        
        if (initialStudyAction === 'CONTINUE_STUDY') {
            studyContinue();
        } else if (initialStudyAction === 'STUDY_FROM_SCRATCH') {
            studyFromScratch();
        } else if (initialStudyAction === 'STUDY_UNFINISHED_CONTENT') {
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
                currentCourseReport={currentCourseReport} />
            <div className="detail-educontent col-10">
                <div className="title">{
                    currentCourseState === "Study" ? currentEduContent.name : "KẾT QUẢ"}</div>
                <div className="slide-container">
                    {
                        currentCourseState === "Study" ?
                        (
                            currentStudyState === "Theory" ?
                                <TheoryContentSlide
                                    key={currentEduContentTheoryIndex}
                                    theory={currentEduContent.theories[currentEduContentTheoryIndex]}
                                    nextHandle={nextSlide} /> :
                            currentStudyState === "Question" ?
                                <QuestionContentSlide
                                    key={currentEduContentQuestionIndex}
                                    question={currentEduContent.questions[currentEduContentQuestionIndex]}
                                    nextHandle={nextSlide}
                                    anwseredCorrectHandle={() => {
                                        currentCourseReport.contentReports[currentEduContentIndex].questionsResults[currentEduContentQuestionIndex] = true;
                                        setCurrentCourseReport({...currentCourseReport}); // Update state
                                    }}
                                    anwseredIncorrectHandle={() => {
                                        currentCourseReport.contentReports[currentEduContentIndex].questionsResults[currentEduContentQuestionIndex] = false;
                                        setCurrentCourseReport({...currentCourseReport}); // Update state
                                    }} /> :
                            null
                        ) :
                        currentCourseState === "Report" ?
                        (
                            <ReportSlide
                                course={course}
                                courseReport={currentCourseReport}
                                totalCourseReports={totalCourseReports}
                                onStudyFromScratch={studyFromScratch}
                                onStudyUnfinishContent={studyUnfinishedContent}
                            />
                        ) :
                        null
                    }
                </div >
            </div>
        </div>
    );
}

interface IntroProps {
    setCourse: (course: EduCourseProps) => void;
    setInitialStudyAction: (studyAction: StudyAction) => void;
    latestCourseReport: EduCourseReportProps;
    latestCourseReportloading: boolean;
}
function Intro({
    slideNext,
    setCourse,
    setInitialStudyAction,
    latestCourseReport,
    latestCourseReportloading,
    }: SamuiSlideComponentProps & IntroProps) {
    const { slug } = useParams();

    /* Manual
    const [ isMounted, setIsMounted ] = React.useState<boolean>(false);
    const [ loading, setLoading ] = React.useState<boolean>(false);
    const start = React.useCallback(() => {
        setIsMounted(true);
        if (loading) return;
        setLoading(true);
        courseService.getOne(slug)
            .then(res => {
                if (isMounted) return;
                setCourse(res);
                setLoading(false);
                slideNext();
            })
            .catch(err => {
                if (isMounted) return;
                console.error(err)
                setLoading(false);
            });
    }, []);
    useEffect(() => {
        return () => {
            setIsMounted(false);
        };
    }, []);
    */

    // Use sync hook
    const [courseLoader, fetchCourse] = useAsyncFn(async() => {
        try {
            const res = await courseService.getOne(slug);
            setCourse(res);
            slideNext();
            return res;
        } catch (err) {
            console.error(err)
            return null;
        }
    }, []);

    return <CourseIntro
        title="Basic Graphic Design Principles"
        posterUrl="/img/basic-graphic-design-principles.png"
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni alias eveniet repudiandae itaque hic facere assumenda, quo nobis? Perferendis placeat praesentium modi autem fugit eos cupiditate qui est eius. Consequuntur!"
        onStart={() => fetchCourse().then(() => setInitialStudyAction('STUDY_FROM_SCRATCH'))}
        onContinue={() => fetchCourse().then(() => setInitialStudyAction('CONTINUE_STUDY'))}
        onStudyUnfinished={() => fetchCourse().then(() => setInitialStudyAction('STUDY_UNFINISHED_CONTENT'))}
        courseLoading={courseLoader.loading}
        latestCourseReportloading={latestCourseReportloading}
        latestCourseReport={latestCourseReport} />
}

///////////////
export default function Loader() {
    const [ course, setCourse ] = React.useState<EduCourseProps>(null);
    const [ initialStudyAction, setInitialStudyAction ] = React.useState<StudyAction>(null);

    // Test
    const { slug } = useParams();
    const latestCourseReportLoader = useAsync(async () => {
        try {
            const res = await courseService.getOne(slug);
            return getCourseReportByLatest();
        } catch (err) {
            console.error(err)
            return null;
        }
    }, []);
    const totalCourseReportsLoader = useAsync(async () => {
        try {
            const res = await courseService.getOne(slug);
            return getTotalCourseReports();
        } catch (err) {
            console.error(err)
            return null;
        }
    }, []);

    return <SamuiSlideProvider
        contents={[
            {
                key: 'intro',
                component: (props) =>
                    <Intro
                        {...props}
                        setCourse={setCourse}
                        setInitialStudyAction={setInitialStudyAction}
                        latestCourseReport={latestCourseReportLoader.value}
                        latestCourseReportloading={latestCourseReportLoader.loading} />,
            },
            {
                key: 'course-page',
                component: () => course
                                && latestCourseReportLoader.value !== undefined
                                && totalCourseReportsLoader.value !== undefined
                                && initialStudyAction &&
                    <Page
                        course={course}
                        latestCourseReport={latestCourseReportLoader.value}
                        initialtotalCourseReports={totalCourseReportsLoader.value}
                        initialStudyAction={initialStudyAction} />
            }
        ]} />
}