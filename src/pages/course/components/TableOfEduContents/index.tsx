import { EduContentProps } from "services/course/types";
import classNames from "classnames";
import { HTMLProps } from "react";
import "./styles.scss";
import { CourseStateType } from "pages/course";

interface TableOfEduContentsProps {
    currentCourseState: CourseStateType;
    eduContents: EduContentProps[];
    currentEduContentIndex: number;
}

export default function TableOfEduContents(props: TableOfEduContentsProps & HTMLProps<HTMLDivElement>) {
    const { currentCourseState, eduContents, currentEduContentIndex } = props;
    return (
        <div {...props} className={classNames(props.className, "table-of-educontents")}>
        {
            eduContents.map((ec, i) => <div
                key={ec.slug}
                className={classNames({"fw-bold" : currentCourseState === "Study" && i === currentEduContentIndex})}>{ec.name}</div>)
        }
        <div className={classNames({"fw-bold" : currentCourseState === "Report"})}>Kết quả</div>
        </div>
    );
}