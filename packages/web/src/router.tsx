import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout.js";
import ScenesPage from "./pages/ScenesPage.js";
import PlayPage from "./pages/PlayPage.js";
import LeaderboardPage from "./pages/LeaderboardPage.js";
import NotFoundPage from "./pages/NotFoundPage.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <ScenesPage /> },
      { path: "scenes/:slug", element: <PlayPage /> },
      { path: "scenes/:slug/leaderboard", element: <LeaderboardPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
