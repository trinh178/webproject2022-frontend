import React from "react";
import "./styles.scss";
import classNames from "classnames";
import { EduContentProps } from "services/course/types";
export interface ContentReportProps {
    content: EduContentProps;
    questionsResults: boolean[];
}
interface ReportSlideProps {
    courseReport: ContentReportProps[];
    onLearnFromScratch: () => void,
}
export default function ReportSlide({ courseReport, onLearnFromScratch }: ReportSlideProps) {
    console.log(courseReport);

    let totalQuestions = 0;
    let nCorrectQuestions = 0;
    for (const cr of courseReport) {
        totalQuestions += cr.questionsResults.length;
        nCorrectQuestions += cr.questionsResults.filter(qr => qr === true).length;
    }

    return (
        <div className="report-slide slide-in-bottom">
            <h2 className="text-center">Bạn đã trả lời đúng</h2>
            <h1 className="text-center">{`${nCorrectQuestions} / ${totalQuestions}`}</h1>
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
                        courseReport.map(cr => {
                            const nCorrect = cr.questionsResults.filter(qr => qr === true).length;
                            return <tr key={cr.content.slug}>
                                <td className="text-end pe-2 border-end">
                                    {cr.content.name}
                                </td>
                                <td className="ps-2">
                                    {`${nCorrect} / ${cr.questionsResults.length}`}
                                </td>
                            </tr>
                        })
                    }
                    <tr>
                        <td className="text-end pe-2 pt-5">
                            <button
                                className="edu-btn"
                                onClick={() => onLearnFromScratch()}>
                                Học lại bài sai
                            </button>
                        </td>
                        <td className="ps-2 pt-5">
                            <button
                                className="edu-btn"
                                onClick={() => onLearnFromScratch()}>
                                Học lại từ đầu
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}