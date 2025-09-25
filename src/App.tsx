import React from "react";
import { Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./routes";

import "styles/app.scss";
import "styles/global.scss";

function App() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Routes>
        {publicRoutes.map((route, index) => {
          const Layout = route.layout ?? React.Fragment;
          const Page = route.component;
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Layout>
                  <Page />
                </Layout>
              }
            />
          );
        })}

        {privateRoutes.map((route, index) => {
          const Layout = route.layout ?? React.Fragment;
          return (
            <Route
              key={index}
              path={route.path}
              element={<Layout>{route.component}</Layout>}
            />
          );
        })}
      </Routes>
    </div>
  );
}

export default App;
