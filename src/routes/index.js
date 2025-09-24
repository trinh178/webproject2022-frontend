import Home from "../pages/Home";
import CoursesPage from "../pages/courses";
import CoursePage from "../pages/course/containers";
import MyCanvas from "../test/my-canvas";
import MyTest from "../test/my-test";

// Public routes (không cần đăng nhập)
const publicRoutes = [
  { path: "/", component: Home },
  { path: "/courses", component: CoursesPage },
  { path: "/course/:slug", component: CoursePage },
  { path: "/mycanvas", component: MyCanvas },
  { path: "/mytest", component: MyTest },
  //   { path: "*", component: <div>Not Found</div> },
];

// Route yêu cầu login
const privateRoutes = [];

export { publicRoutes, privateRoutes };
