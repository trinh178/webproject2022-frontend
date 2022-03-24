import React from "react";
import "./styles.scss";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import _ from "lodash";
import { TheoryContentSlide, QuestionContentSlide } from "./components";
import * as courseService from "services/course";
import { EduCourseProps } from "services/course/types";
import CourseIntro from "./components/CourseIntro";
import TableOfEduContents from "./components/TableOfEduContents";
import ReportSlide from "./components/ReportSlide";
import SamuiSlideProvider, { SamuiSlideComponentProps } from "shared/components/SamuiSlideProvider";

export type CourseStateType = "Study" | "Report";
type StudyStateType = "Theory" | "Question";
interface CoursePageProps {
    course: EduCourseProps,
}
function Page({ course }: CoursePageProps) {
    if (!course) return null;
    const [currentEduContentIndex, setCurrentEduContentIndex] = React.useState<number>(0);
    const currentEduContent = course.contents[currentEduContentIndex];

    const [currentCourseState, setCurrentCourseState] = React.useState<CourseStateType>("Study");
    const [currentStudyState, setCurrentStudyState] = React.useState<StudyStateType>("Theory");
    const [currentEduContentTheoryIndex, setCurrentEduContentTheoryIndex] = React.useState<number>(0);
    const [currentEduContentQuestionIndex, setCurrentEduContentQuestionIndex] = React.useState<number>(0);

    const handleFinish = () => {
        setCurrentCourseState("Report");
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

                if (currentEduContentIndex + 1 < course.contents.length) {
                    setCurrentEduContentIndex(currentEduContentIndex + 1);
                } else {
                    handleFinish();
                }
            }
        }
    };

    return (
        <div className="course-page container-fluid row g-0 slide-in-bottom">
            <TableOfEduContents
                className="col-2"
                currentCourseState={currentCourseState}
                eduContents={course.contents}
                currentEduContentIndex={currentEduContentIndex} />
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
                                    nextHandle={handleNext} /> :
                            null
                        ) :
                        currentCourseState === "Report" ?
                        (
                            <ReportSlide />
                        ) :
                        null
                    }
                </div >
            </div>
        </div>
    );
}

interface IntroProps {
    setCourse: (course: EduCourseProps) => void,
}
function Intro({ slideNext, setCourse }: SamuiSlideComponentProps & IntroProps) {
    const { slug } = useParams();
    const [ loading, setLoading ] = React.useState<boolean>(false);

    const start = React.useCallback(() => {
        setLoading(true);
        courseService.getOne(slug)
            .then(res => {
                setTimeout(() => {
                    setCourse(res);
                    setLoading(false);
                    slideNext();
                }, 1000);
            })
            .catch(err => {
                console.error(err)
                setLoading(false);
            });
    }, []);

    return <CourseIntro
        title="Basic Graphic Design Principles"
        posterUrl="/img/basic-graphic-design-principles.png"
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni alias eveniet repudiandae itaque hic facere assumenda, quo nobis? Perferendis placeat praesentium modi autem fugit eos cupiditate qui est eius. Consequuntur!"
        onStart={() => {
            start();
        }}
        loading={loading} />
}

///////////////
export default function Loader() {
    const [ course, setCourse ] = React.useState<EduCourseProps>(null);
    return <SamuiSlideProvider
        contents={[
            {
                key: 'intro',
                component: (props) => <Intro {...props} setCourse={setCourse} />,
            },
            {
                key: 'course-page',
                component: () => <Page course={course} />
            }
        ]} />
}