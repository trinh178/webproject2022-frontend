import React from "react";
import "./styles.scss";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import _ from "lodash";
import { TheoryContentSlide, QuestionContentSlide } from "./components";
import * as courseService from "services/course";
import { EduCourseProps } from "services/course/types";

type EduContextStateType = "Theory" | "Question";
interface CoursePageProps {
    course: EduCourseProps,
}
function Page({ course }: CoursePageProps) {
    const [currentEduContentIndex, setCurrentEduContentIndex] = React.useState<number>(0);
    const currentEduContent = course.contents[currentEduContentIndex];

    const [currentEduContentState, setCurrentEduContentState] = React.useState<EduContextStateType>("Theory");
    const [currentEduContentTheoryIndex, setCurrentEduContentTheoryIndex] = React.useState<number>(0);
    const [currentEduContentQuestionIndex, setCurrentEduContentQuestionIndex] = React.useState<number>(0);

    const handleNext = () => {
        if (currentEduContentState === "Theory") {
            if (currentEduContentTheoryIndex + 1 < currentEduContent.theories.length) {
                setCurrentEduContentTheoryIndex(currentEduContentTheoryIndex + 1);
            } else {
                setCurrentEduContentQuestionIndex(0);
                setCurrentEduContentState("Question");
            }
        } else if (currentEduContentState === "Question") {
            if (currentEduContentQuestionIndex + 1 < currentEduContent.questions.length) {
                setCurrentEduContentQuestionIndex(currentEduContentQuestionIndex + 1);
            } else {
                setCurrentEduContentTheoryIndex(0);
                setCurrentEduContentState("Theory");

                if (currentEduContentIndex + 1 < course.contents.length) {
                    setCurrentEduContentIndex(currentEduContentIndex + 1);
                } else {
                    alert("Finish");
                }
            }
        }
    };

    return (
        <div className="course-page container-fluid row g-0">
            <div className="table-of-educontents col-2">
                {
                    course.contents.map((ec, i) => <div
                        key={ec.slug}
                        className={classNames({"fw-bold" : i === currentEduContentIndex})}>{ec.name}</div>)
                }
            </div>
            <div className="detail-educontent col-10">
                <div className="title">{currentEduContent.name}</div>
                <div className="slide-container">
                    {
                        currentEduContentState === "Theory" ?
                            <TheoryContentSlide
                                key={currentEduContentTheoryIndex}
                                theory={currentEduContent.theories[currentEduContentTheoryIndex]}
                                nextHandle={handleNext} /> :
                        currentEduContentState === "Question" ?
                            <QuestionContentSlide
                                key={currentEduContentQuestionIndex}
                                question={currentEduContent.questions[currentEduContentQuestionIndex]}
                                nextHandle={handleNext} /> :
                        null
                    }
                </div >
            </div>
        </div>
    );
}

///////////////
export default function Loader() {
    const { slug } = useParams();
    const [ course, setCourse ] = React.useState<EduCourseProps>(null);
    const [ loading, setLoading ] = React.useState<boolean>(false);

    React.useEffect(() => {
        setLoading(true);
        courseService.getOne(slug)
            .then(res => {
                setCourse(res);
                setLoading(false);
            })
            .catch(err => {
                console.error(err)
                setLoading(false);
            });
    }, []);

    if (!course) return <div>Loading..</div>;
    return <Page course={course} />
}