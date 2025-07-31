import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts";

import "styles/app.scss";
import "styles/global.scss";

import Toolbar from "shared/components/Toolbar";
import Footer from "shared/components/Footer";

import CoursesPage from "pages/courses";
import CoursePage from "pages/course/containers";
import MyCanvas from "test/my-canvas";
import MyTest from "test/my-test";

function App() {
  return (
    <>
      {/* <div style={{ width: "100%", height: "5vh" }}><Toolbar /></div> */}
      <div style={{ width: "100%", height: "100%" }}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<div>index</div>} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="course/:slug" element={<CoursePage />} />
            <Route path="mycanvas" element={<MyCanvas />} />
            <Route path="mytest" element={<MyTest />} />
            <Route path="*" element={<div>Not Found</div>} />
          </Route>
        </Routes>
      </div>
      {/* <div style={{ width: "100%", height: "3vh" }}><Footer /></div> */}
    </>
  );
}
export default App;
