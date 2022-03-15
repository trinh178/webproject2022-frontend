import { Routes, Route } from "react-router-dom"
import { MainLayout } from "./layouts";

import "styles/app.scss";
import "styles/global.scss";

import CoursesPage from "pages/courses";
import CoursePage from "pages/course";
import MyCanvas from "test/my-canvas";
import MyTest from "test/my-test";

function App() {
    return <Routes>
        <Route path="/" element={<MainLayout />}>
            <Route index element={<div>index</div>} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="course/:slug" element={<CoursePage />} />
            <Route path="mycanvas" element={<MyCanvas />} />
            <Route path="mytest" element={<MyTest />} />
            <Route path="*" element={<div>Not Found</div>} />
        </Route>
    </Routes>
}
export default App;