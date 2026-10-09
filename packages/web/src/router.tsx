import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout.js";
import ScenesPage from "./pages/ScenesPage.js";
import PlayPage from "./pages/PlayPage.js";
import LeaderboardPage from "./pages/LeaderboardPage.js";
import NotFoundPage from "./pages/NotFoundPage.js";
import ErrorPage from "./pages/ErrorPage.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <ScenesPage /> },
      { path: "scenes/:slug", element: <PlayPage /> },
      { path: "scenes/:slug/leaderboard", element: <LeaderboardPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
