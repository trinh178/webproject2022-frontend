import qs from "qs";
import { EduCoursePreviewProps } from "./types";

interface CourseGetAllResponseProps {
    id: number;
    attributes: {
        name: string;
        slug: string;
    },
}

export default async function api(): Promise<EduCoursePreviewProps[]> {
    const query: string = qs.stringify({
        fields: ['name', 'slug'],
    });
    const res = await fetch(`${process.env.REACT_APP_END_POINT}/api/courses?${query}`);
    const data = await res.json();
    return mapping(data);
}

function mapping(res: ResponseWrapperProps<CourseGetAllResponseProps>) {
    const courses: EduCoursePreviewProps[] = res.data.map(c => ({
        name: c.attributes.name,
        slug: c.attributes.slug,
    }))
    return courses;
}