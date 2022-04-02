import React from "react";
import { useParams } from "react-router-dom";
import * as courseService from "services/course";
import { EduCourseProps, EduCourseReportProps, EduReportType } from "services/course/types";
import CourseIntro from "../components/CourseIntro";
import SamuiSlideProvider, { SamuiSlideControlsProps } from "shared/components/SamuiSlideProvider";
import { useAsync, useAsyncFn } from "react-use";
import Course, { StudyAction } from "./Course";

export function getTotalCourseReports(): number {
    return Number.parseInt(localStorage.getItem("__totalCourseReports")) || 0;
}
export function getCourseReportByLatest(): EduCourseReportProps {
    const latestCourseReport = JSON.parse(localStorage.getItem("__latestCourseReport")) as EduCourseReportProps;
    return latestCourseReport;
}
export function updateCourseReport(courseReport: EduCourseReportProps) {
    // update by id if server
    localStorage.setItem("__latestCourseReport", JSON.stringify(courseReport));
}
export function createCourseReport(
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
            id: "test",
            contentReports: course.contents.map(c => ({
                questionsResults: c.questions.map(q => false),
                studyStatus: 'NOT_STARTED',
            })),
            studyStatus: 'STUDYING', // Start study status for course
            reportType: type,
        };
    } else if (type === 'STUDY_UNFINISHED_CONTENTS') {
        if (!latestCourseReport) alert("error latestCourseReport");
        cr = {
            id: "test",
            contentReports: latestCourseReport.contentReports.map(c => ({
                questionsResults: c.questionsResults.map(q => c.studyStatus === 'STUDIED_UNFINISHED' ? false : q),
                studyStatus: c.studyStatus === 'STUDIED_UNFINISHED' ? 'NOT_STARTED' : c.studyStatus,
            })),
            studyStatus: 'STUDYING', // Start study status for course
            reportType: type,
        };
    }
    localStorage.setItem("__latestCourseReport", JSON.stringify(cr));
    localStorage.setItem("__totalCourseReports", ((Number.parseInt(localStorage.getItem("__totalCourseReports"))  || 0) + 1).toString());
    return cr;
}

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
            samuiSlideControlsRef.current.slideNext();
            return res;
        } catch (err) {
            console.error(err)
            return null;
        }
    }, []);

    const samuiSlideControlsRef = React.useRef<SamuiSlideControlsProps>(null);

    return <SamuiSlideProvider
        slideControlsRef={samuiSlideControlsRef}
        contents={[
            {
                key: 'intro',
                component: (props) =>
                    <CourseIntro
                        title="Basic Graphic Design Principles"
                        posterUrl="/img/basic-graphic-design-principles.png"
                        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni alias eveniet repudiandae itaque hic facere assumenda, quo nobis? Perferendis placeat praesentium modi autem fugit eos cupiditate qui est eius. Consequuntur!"
                        onStart={() => fetchCourse().then(() => setInitialStudyAction('STUDY_FROM_SCRATCH'))}
                        onContinue={() => fetchCourse().then(() => setInitialStudyAction('CONTINUE_STUDY'))}
                        onStudyUnfinished={() => fetchCourse().then(() => setInitialStudyAction('STUDY_UNFINISHED_CONTENTS'))}
                        courseLoading={courseLoader.loading}
                        latestCourseReportloading={latestCourseReportLoader.loading}
                        latestCourseReport={latestCourseReportLoader.value} />,
            },
            {
                key: 'course-page',
                component: () => course
                                && latestCourseReportLoader.value !== undefined
                                && totalCourseReportsLoader.value !== undefined
                                && initialStudyAction &&
                    <Course
                        course={course}
                        latestCourseReport={latestCourseReportLoader.value}
                        initialtotalCourseReports={totalCourseReportsLoader.value}
                        initialStudyAction={initialStudyAction} />
            }
        ]} />
}