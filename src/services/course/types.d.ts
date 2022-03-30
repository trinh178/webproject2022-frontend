export interface EduContentQuestionAnswerProps {
    imgUrl: string;
}
export interface EduContentQuestionProps {
    correctAnswer: EduContentQuestionAnswerProps;
    incorrectAnswer: EduContentQuestionAnswerProps;
}
export interface EduContentTheoryProps {
    initialText: string;
    animationScript: string;
}
export interface EduContentProps {
    name: string;
    slug: string;
    theories: EduContentTheoryProps[];
    questions: EduContentQuestionProps[];
}

export type EduStudyStatus = "NOT_STARTED" | "STUDYING" | "STUDIED_UNFINISHED" | "STUDIED_FININSHED";
export interface EduCourseProps {
    name: string;
    slug: string;
    contents: EduContentProps[];
}
export interface EduCoursePreviewProps {
    name: string;
    slug: string;
}
export interface EduContentReportProps {
    questionsResults: boolean[];
    studyStatus: EduStudyStatus;
}
export interface EduCourseReportProps {
    contentReports: EduContentReportProps[];
    studyStatus: EduStudyStatus;
}