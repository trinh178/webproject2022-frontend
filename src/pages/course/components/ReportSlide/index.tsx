import React from "react";
import "./styles.scss";
import classNames from "classnames";
import { EduContentProps, EduContentReportProps, EduCourseProps, EduCourseReportProps } from "services/course/types";
interface ReportSlideProps {
    course: EduCourseProps;
    courseReport: EduCourseReportProps;
    totalCourseReports: number;
    onStudyFromScratch: () => void;
    onStudyUnfinishContent: () => void;
}
export default function ReportSlide({ course, courseReport, totalCourseReports, onStudyFromScratch, onStudyUnfinishContent }: ReportSlideProps) {
    let totalQuestions = 0;
    let nCorrectQuestions = 0;
    for (const cr of courseReport.contentReports) {
        totalQuestions += cr.questionsResults.length;
        nCorrectQuestions += cr.questionsResults.filter(qr => qr === true).length;
    }

    return (
        <div className="report-slide slide-in-bottom">
            <h2 className="text-center">Bạn đã trả lời đúng</h2>
            <h1 className="text-center">{`${nCorrectQuestions} / ${totalQuestions}`}</h1>
            <h6 className="text-center">Sau {totalCourseReports} lần học</h6>
            <br />
            <h5 className="text-center text-decoration-underline">Chi tiết</h5>
            <table className="w-50 m-auto">
                <thead>
                    <tr>
                        <th className="w-50 text-end pe-2 border-end">Nội dung</th>
                        <th className="ps-2">Trả lời đúng</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        courseReport.contentReports.map((cr, i) => {
                            const nCorrect = cr.questionsResults.filter(qr => qr === true).length;
                            return <tr key={course.contents[i].slug}>
                                <td className="text-end pe-2 border-end">
                                    {course.contents[i].name}
                                </td>
                                <td className="ps-2">
                                    {`${nCorrect} / ${cr.questionsResults.length}`}
                                </td>
                            </tr>
                        })
                    }
                    <tr>
                        {
                            nCorrectQuestions !== totalQuestions &&
                                <td className="text-end pe-2 pt-5">
                                    <button
                                        className="edu-btn"
                                        onClick={() => onStudyUnfinishContent()}>
                                        Học lại bài sai
                                    </button>
                                </td>
                        }
                        <td
                            className={classNames("ps-2 pt-5", {"text-center": nCorrectQuestions === totalQuestions})}
                            colSpan={nCorrectQuestions === totalQuestions ? 2 : 1}>
                            <button
                                className="edu-btn"
                                onClick={() => onStudyFromScratch()}>
                                Học lại từ đầu
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}