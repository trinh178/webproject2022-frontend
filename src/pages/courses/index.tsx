import React from "react";
import { EduCoursePreviewProps } from "services/course/types";
import * as courseService from "services/course";
import { Link } from "react-router-dom";

interface CoursesPageProps {
    courses: EduCoursePreviewProps[],
}
function Page({ courses }: CoursesPageProps) {
    return (
        <div className="courses-page row">
            {
                courses.map(c => <div className="col-2">
                    <Link
                        className="btn btn-secondary d-flex justify-content-center text-center align-items-center"
                        style={{height: 200, fontSize: "2rem"}}
                        to={`/course/${c.slug}`}
                    >{c.name}</Link>
                </div>)
            }
        </div>
    );
}
export default function Loader() {
    const [ courses, setCourses ] = React.useState<EduCoursePreviewProps[]>(null);
    const [ loading, setLoading ] = React.useState<boolean>(false);

    React.useEffect(() => {
        setLoading(true);
        courseService.getAll()
            .then(res => {
                setCourses(res);
                setLoading(false);
            })
            .catch(err => {
                console.log(err)
                setLoading(false);
            });
    }, []);

    if (!courses) return <div>Loading..</div>;
    return <Page courses={courses} />
}