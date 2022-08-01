import React from "react";
import { EduCourseReportProps } from "services/course/types";
import "./styles.scss";

interface CourseIntroProps {
    posterUrl: string;
    title: string;
    description: string;
    onStart: () => void;
    onContinue: () => void;
    onStudyUnfinished: () => void;
    courseLoading: boolean;
    latestCourseReportloading: boolean;
    latestCourseReport: EduCourseReportProps;
}
export default function CourseIntro({
    posterUrl,
    title,
    description,
    onStart,
    onContinue,
    onStudyUnfinished,
    courseLoading,
    latestCourseReportloading,
    latestCourseReport,
}: CourseIntroProps) {
    const renderButton = () => {
        switch (latestCourseReport?.studyStatus) {
            case null || undefined:
            case "NOT_STARTED":
                return <div className="edu-btn mt-4" onClick={() => onStart()}>{ courseLoading ? "Bắt đầu.." : "Bắt đầu"}</div>;
            case "STUDYING":
                return <>
                    <div className="edu-btn mt-4" onClick={() => onContinue()}>{ courseLoading ? "Tiếp tục học.." : "Tiếp tục học"}</div>
                    <div className="edu-btn mt-4" onClick={() => onStart()}>{ courseLoading ? "Học lại từ đầu.." : "Học lại từ đầu"}</div>
                </>;
            case "STUDIED_UNFINISHED":
                return <>
                    <div className="edu-btn mt-4" onClick={() => onStudyUnfinished()}>{ courseLoading ? "Học lại bài sai.." : "Học lại bài sai"}</div>
                    <div className="edu-btn mt-4" onClick={() => onStart()}>{ courseLoading ? "Học lại từ đầu.." : "Học lại từ đầu"}</div>
                </>;
            case "STUDIED_FININSHED":
                return <div className="edu-btn mt-4" onClick={() => onStart()}>{ courseLoading ? "Học lại.." : "Học lại"}</div>;
            default: return null;
        }
    };
    return (
        <div className="course-intro">
            <div className="poster">
                <img src={posterUrl}/>
                <div className="title">{title}</div>
            </div>
            <div className="description">{description}</div>
            <div className="actions">
                {
                    latestCourseReportloading ? "loading.." : renderButton()
                }
            </div>
        </div>
    );
}