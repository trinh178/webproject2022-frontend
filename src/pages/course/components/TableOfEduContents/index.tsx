import { EduContentReportProps, EduContentProps, EduCourseProps } from "services/course/types";
import classNames from "classnames";
import { HTMLProps } from "react";
import "./styles.scss";
import { CourseStateType } from "pages/course";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faEllipsis,
  faMinus,
  faFlagCheckered,
} from "@fortawesome/free-solid-svg-icons";

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
            <div className="course-title">{course.name}</div>
            <table>
                {
                    course.contents.map((ec, i) => <>
                        <tr>
                            <td className={classNames("box", {"bg-black": i === currentEduContentIndex && currentCourseState === 'Study'})}>
                                {i === currentEduContentIndex && currentCourseState === 'Study'
                                ? <FontAwesomeIcon key="studying" icon={faEllipsis} color="white" className="scale-up-center"/>
                                : isStudyingUnfinishedContent || i <= currentEduContentIndex
                                ? (contentReports[i].studyStatus === 'STUDIED_FININSHED'
                                ? <FontAwesomeIcon key="studied-finished" icon={faCircleCheck} color="green" className="scale-up-center" />
                                : <FontAwesomeIcon key="studied-unfinished" icon={faCircleXmark} color="red" className="scale-up-center" />)
                                : <FontAwesomeIcon key="not-started" icon={faMinus} className="scale-up-center" />}
                            </td>
                            <td className="title">
                                <span
                                    key={ec.slug}
                                    className={classNames({"fw-bold" : currentCourseState === "Study" && i === currentEduContentIndex})}>
                                    {ec.name}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td><div className="line"></div></td>
                        </tr>
                    </>)
                }
                <tr>
                    <td><div className="line"></div></td>
                </tr>
                <tr>
                    <td className={classNames("box", {"bg-black": currentCourseState === 'Report'})}>
                        <FontAwesomeIcon icon={faFlagCheckered} color={currentCourseState === 'Report' ? 'white' : 'black'} />
                    </td>
                    {/*<td className="title">
                        <span
                            key="report"
                            className={classNames({"fw-bold" : currentCourseState === "Report"})}>
                            Kết quả
                        </span>
                    </td>*/}
                </tr>
            </table>
        </div>
    );
}