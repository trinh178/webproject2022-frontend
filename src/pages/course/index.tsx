import React, { useEffect } from "react";
import "./styles.scss";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import _ from "lodash";
import { TheoryContentSlide, QuestionContentSlide } from "./components";
import * as courseService from "services/course";
import { EduContentReportProps, EduCourseProps, EduCourseReportProps } from "services/course/types";
import CourseIntro from "./components/CourseIntro";
import TableOfEduContents from "./components/TableOfEduContents";
import ReportSlide from "./components/ReportSlide";
import SamuiSlideProvider, { SamuiSlideComponentProps } from "shared/components/SamuiSlideProvider";
import { useAsync, useAsyncFn } from "react-use";

export type CourseStateType = "Study" | "Report";
export type StudyStateType = "Theory" | "Question";
export type StudyAction = "STUDY_FROM_SCRATCH" | "CONTINUE_STUDY" | "STUDY_UNFINISHED_CONTENT";
interface CoursePageProps {
    course: EduCourseProps;
    courseReport: EduCourseReportProps;
    studyAction: StudyAction;
}
function Page({ course, courseReport: initialCourseReport, studyAction: initialStudyAction }: CoursePageProps) {
    if (!course) return null;

    const [currentCourseState, setCurrentCourseState] = React.useState<CourseStateType>("Study");
    const [currentStudyState, setCurrentStudyState] = React.useState<StudyStateType>("Theory");
    const [currentEduContentTheoryIndex, setCurrentEduContentTheoryIndex] = React.useState<number>(0);
    const [currentEduContentQuestionIndex, setCurrentEduContentQuestionIndex] = React.useState<number>(0);
    const [studyAction, setStudyAction] = React.useState<StudyAction>(initialStudyAction);
    const [courseReport, setCourseReport] = React.useState<EduCourseReportProps>(initialCourseReport);
    const [currentEduContentIndex, setCurrentEduContentIndex] = React.useState<number>(() => {
        if (initialStudyAction === 'CONTINUE_STUDY') {
            for (let i = 0; i < courseReport.contentReports.length; i++) {
                if (courseReport.contentReports[i].studyStatus === 'NOT_STARTED'
                || courseReport.contentReports[i].studyStatus === 'STUDYING')
                    return i;
            }
        }
        return 0;
    });
    const currentEduContent = course.contents[currentEduContentIndex];

    const stydyFromScratch = () => {
        setCurrentEduContentIndex(0);
        setCurrentCourseState("Study");
        setCurrentStudyState("Theory");
        setCurrentEduContentTheoryIndex(0);
        setCurrentEduContentQuestionIndex(0);
        setStudyAction('STUDY_FROM_SCRATCH');
        setCourseReport(initialCourseReport);
    }
    const studyUnfinishedContent = () => {
        setCurrentCourseState("Study");
        setCurrentStudyState("Theory");
        setCurrentEduContentTheoryIndex(0);
        setCurrentEduContentQuestionIndex(0);
        setStudyAction('STUDY_UNFINISHED_CONTENT');
        nextContent(true, true);
    };

    const nextContent = (onlyUnfinished: boolean = false, isBegin: boolean = false) => {
        let i = isBegin ? 0 : currentEduContentIndex + 1;
        if (onlyUnfinished) {
            for (; i < course.contents.length; i++) {
                if (courseReport.contentReports[i].studyStatus !== 'STUDIED_FININSHED') break;
            }
        }
        if (i === course.contents.length) {
            setCurrentCourseState("Report");
            return;
        }
        setCurrentEduContentIndex(i);
    };

    const handleNext = () => {
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
                nextContent(studyAction === 'STUDY_UNFINISHED_CONTENT');
            }
        }
    };

    // Update study status
    React.useEffect(() => {
        courseReport.contentReports[currentEduContentIndex].studyStatus = 'STUDYING';
        setCourseReport({...courseReport});
        localStorage.setItem("__courseReport", JSON.stringify(courseReport));
        return () => {
            courseReport.contentReports[currentEduContentIndex].studyStatus
                = courseReport.contentReports[currentEduContentIndex].questionsResults.includes(false)
                    ? 'STUDIED_UNFINISHED'
                    : 'STUDIED_FININSHED';
            setCourseReport({...courseReport});
            localStorage.setItem("__courseReport", JSON.stringify(courseReport));
        }
    }, [currentEduContentIndex]);
    React.useEffect(() => {
        if (currentCourseState === 'Study') {
            courseReport.studyStatus = 'STUDYING';
            localStorage.setItem("__courseReport", JSON.stringify(courseReport));
        } else if (currentCourseState === 'Report') {
            // Update study status of last content index here because not change index after switch course state to report
            courseReport.contentReports[currentEduContentIndex].studyStatus
                = courseReport.contentReports[currentEduContentIndex].questionsResults.includes(false)
                    ? 'STUDIED_UNFINISHED'
                    : 'STUDIED_FININSHED';

            courseReport.studyStatus
                = courseReport.contentReports.filter(cr => cr.studyStatus !== 'STUDIED_FININSHED').length !== 0
                    ? 'STUDIED_UNFINISHED'
                    : 'STUDIED_FININSHED';
            setCourseReport({...courseReport});
            localStorage.setItem("__courseReport", JSON.stringify(courseReport));
        }
    }, [currentStudyState]);
    // Event
    React.useEffect(() => {
        if (currentCourseState === 'Report') {
            // Handle studied all contents
        }
    }, [currentCourseState]);

    return (
        <div className="course-page container-fluid row g-0 slide-in-bottom">
            <TableOfEduContents
                className="col-2"
                course={course}
                currentCourseState={currentCourseState}
                currentEduContentIndex={currentEduContentIndex}
                contentReports={courseReport.contentReports}
                isStudyingUnfinishedContent={studyAction === 'STUDY_UNFINISHED_CONTENT'} />
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
                                    nextHandle={handleNext} /> :
                            currentStudyState === "Question" ?
                                <QuestionContentSlide
                                    key={currentEduContentQuestionIndex}
                                    question={currentEduContent.questions[currentEduContentQuestionIndex]}
                                    nextHandle={handleNext}
                                    anwseredCorrectHandle={() => {
                                        courseReport.contentReports[currentEduContentIndex].questionsResults[currentEduContentQuestionIndex] = true;
                                        setCourseReport({...courseReport});
                                        localStorage.setItem("__courseReport", JSON.stringify(courseReport));
                                    }}
                                    anwseredIncorrectHandle={() => {
                                        courseReport.contentReports[currentEduContentIndex].questionsResults[currentEduContentQuestionIndex] = false;
                                        setCourseReport({...courseReport});
                                        localStorage.setItem("__courseReport", JSON.stringify(courseReport));
                                    }} /> :
                            null
                        ) :
                        currentCourseState === "Report" ?
                        (
                            <ReportSlide
                                course={course}
                                courseReports={courseReport}
                                onStudyFromScratch={stydyFromScratch}
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
    setStudyAction: (studyAction: StudyAction) => void;
    courseReport: EduCourseReportProps;
    courseReportloading: boolean;
}
function Intro({
    slideNext,
    setCourse,
    setStudyAction,
    courseReport,
    courseReportloading,
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
    const [courseData, fetchCourseData] = useAsyncFn(async() => {
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
        onStart={() => fetchCourseData().then(() => setStudyAction('STUDY_FROM_SCRATCH'))}
        onContinue={() => fetchCourseData().then(() => setStudyAction('CONTINUE_STUDY'))}
        onStudyUnfinished={() => fetchCourseData().then(() => setStudyAction('STUDY_UNFINISHED_CONTENT'))}
        courseLoading={courseData.loading}
        courseReportloading={courseReportloading}
        courseReport={courseReport} />
}

///////////////
export default function Loader() {
    const [ course, setCourse ] = React.useState<EduCourseProps>(null);
    const [ courseReport, setCourseReport ] = React.useState<EduCourseReportProps>(null);
    const [ studyAction, setStudyAction ] = React.useState<StudyAction>(null);

    // Test
    const { slug } = useParams();
    const createCourseReport = (course: EduCourseProps) => {
        const cr: EduCourseReportProps = {
            contentReports: course.contents.map((c, i) => ({
                questionsResults: c.questions.map(q => false),
                studyStatus: "NOT_STARTED",
            })),
            studyStatus: "NOT_STARTED",
        };
        //cr.contentReports[0].studyStatus = 'STUDIED_FININSHED';
        //cr.contentReports[1].studyStatus = 'STUDYING';
        return JSON.parse(localStorage.getItem("__courseReport")) as EduCourseReportProps || cr;
    };
    const courseReportData = useAsync(async () => {
        try {
            const res = await courseService.getOne(slug);
            const cr = createCourseReport(res);
            setCourseReport(cr);
            return cr;
        } catch (err) {
            console.error(err)
            return null;
        }
    }, []);

    return <SamuiSlideProvider
        contents={[
            {
                key: 'intro',
                component: (props) => <Intro
                                        {...props}
                                        setCourse={setCourse}
                                        setStudyAction={setStudyAction}
                                        courseReport={courseReport}
                                        courseReportloading={courseReportData.loading} />,
            },
            {
                key: 'course-page',
                component: () => course && courseReport && studyAction && <Page course={course} courseReport={courseReport} studyAction={studyAction} />
            }
        ]} />
}