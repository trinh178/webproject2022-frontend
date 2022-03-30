import { EduContentReportProps, EduContentProps, EduCourseProps } from "services/course/types";
import classNames from "classnames";
import { HTMLProps } from "react";
import "./styles.scss";
import { CourseStateType } from "pages/course";

interface TableOfEduContentsProps {
    course: EduCourseProps;
    currentCourseState: CourseStateType;
    currentEduContentIndex: number;
    contentReports: EduContentReportProps[];
    isStudyingUnfinishedContent: boolean;
}

export default function TableOfEduContents(props: TableOfEduContentsProps & HTMLProps<HTMLDivElement>) {
    const {
        course,
        currentCourseState,
        currentEduContentIndex,
        contentReports,
        isStudyingUnfinishedContent,
        ...divProps } = props;

    return (
        <div {...divProps} className={classNames(props.className, "table-of-educontents")}>
        {
            course.contents.map((ec, i) => <div
                key={ec.slug}
                className={classNames({"fw-bold" : currentCourseState === "Study" && i === currentEduContentIndex})}>
                {`${i === currentEduContentIndex && currentCourseState === 'Study'
                    ? '- '
                    : isStudyingUnfinishedContent || i <= currentEduContentIndex
                    ? (contentReports[i].studyStatus === 'STUDIED_FININSHED' ? 'O ': 'X ')
                    : '- '} ${ec.name}`}
            </div>)
        }
        <div className={classNames({"fw-bold" : currentCourseState === "Report"})}>Kết quả</div>
        </div>
    );
}