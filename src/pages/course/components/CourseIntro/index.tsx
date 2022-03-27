import React from "react";
import "./styles.scss";

interface CourseIntroProps {
    posterUrl: string,
    title: string,
    description: string,
    onStart: () => void,
    loading: boolean,
}
export default function CourseIntro({
    posterUrl,
    title,
    description,
    onStart,
    loading,
}: CourseIntroProps) {
    return (
        <div className="course-intro">
            <div className="poster">
                <img src={posterUrl}/>
                <div className="title">{title}</div>
            </div>
            <div className="description">{description}</div>
            <div className="edu-btn mt-4" onClick={() => onStart()}>{ loading ? "Starting.." : "Start"}</div>
        </div>
    );
}