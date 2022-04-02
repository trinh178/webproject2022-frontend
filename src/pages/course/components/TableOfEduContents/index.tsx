import { EduContentReportProps, EduContentProps, EduCourseProps, EduCourseReportProps } from "services/course/types";
import classNames from "classnames";
import React, { HTMLProps } from "react";
import "./styles.scss";
import { CourseStateType } from "pages/course/containers/Course";
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
    currentCourseReport: EduCourseReportProps;
}

export default function TableOfEduContents(props: TableOfEduContentsProps & HTMLProps<HTMLDivElement>) {
    const {
        course,
        currentCourseState,
        currentEduContentIndex,
        currentCourseReport,
        ...divProps } = props;

    const contentReports: EduContentReportProps[] = currentCourseReport.contentReports;

    return (
        <div {...divProps} className={classNames(props.className, "table-of-educontents")}>
            <div className="course-title">{course.name}</div>
            <table>
                <tbody>
                {
                    course.contents.map((ec, i) => <React.Fragment key={ec.slug}>
                        <tr key={ec.slug}>
                            <td key="box" className={classNames("box", {"bg-black": contentReports[i].studyStatus === 'STUDYING'})}>
                                {
                                    contentReports[i].studyStatus === 'NOT_STARTED'
                                    ? <FontAwesomeIcon key="not-started" icon={faMinus} className="scale-up-center" />
                                    : contentReports[i].studyStatus === 'STUDYING'
                                    ? <FontAwesomeIcon key="studying" icon={faEllipsis} color="white" className="scale-up-center"/>
                                    : contentReports[i].studyStatus === 'STUDIED_UNFINISHED'
                                    ? <FontAwesomeIcon key="studied-unfinished" icon={faCircleXmark} color="red" className="scale-up-center" />
                                    : contentReports[i].studyStatus === 'STUDIED_FININSHED'
                                    ? <FontAwesomeIcon key="studied-finished" icon={faCircleCheck} color="green" className="scale-up-center" />
                                    : null
                                }
                            </td>
                            {/* by process
                            <td className={classNames("box", {"bg-black": contentReports[i].studyStatus === 'STUDYING'})}>
                                <div className="process" style={{
                                    top:
                                        `${100 - contentReports[i].questionsResults.filter(q => q).length * 100 / contentReports[i].questionsResults.length}%`}}></div>
                            </td>
                            */}
                            <td key="title" className="title">
                                <span
                                    key={ec.slug}
                                    className={classNames({"fw-bold" : contentReports[i].studyStatus === 'STUDYING'})}>
                                    {ec.name}
                                </span>
                            </td>
                        </tr>
                        <tr key={ec.slug + "line"}>
                            <td><div className="line"></div></td>
                        </tr>
                    </React.Fragment>)
                }
                <tr key="line">
                    <td><div className="line"></div></td>
                </tr>
                <tr key="report">
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
                </tbody>
            </table>
        </div>
    );
}