import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Blogs from "./pages/Blogs";
import Careers from "./pages/Careers";
import Inquire from "./pages/Inquire";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "services", Component: Services },
      { path: "blogs", Component: Blogs },
      { path: "careers", Component: Careers },
      { path: "inquire", Component: Inquire },
    ],
  },
]);
