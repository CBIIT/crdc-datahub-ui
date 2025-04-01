import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import Layout from "./layouts";
import withTracking from "./components/Hocs/withTracking";
import LazyLoader from "./components/LazyLoader";
import RequireAuth from "./components/RequireAuth";

// Layouts
const MainLayout = withTracking(Layout);

// Pages
const Home = LazyLoader(lazy(() => import("./content")));
const Login = LazyLoader(lazy(() => import("./content/Login/Controller")));
const Questionnaire = LazyLoader(lazy(() => import("./content/questionnaire/Controller")));
const DataSubmissions = LazyLoader(lazy(() => import("./content/dataSubmissions/Controller")));
const Users = LazyLoader(lazy(() => import("./content/users/Controller")));
const ModelNavigator = LazyLoader(lazy(() => import("./content/ModelNavigator/Controller")));
const ReleaseNotes = LazyLoader(lazy(() => import("./content/ReleaseNotes/Controller")));
const Organizations = LazyLoader(lazy(() => import("./content/organizations/Controller")));
const Studies = LazyLoader(lazy(() => import("./content/studies/Controller")));
const Status404 = LazyLoader(lazy(() => import("./content/status/Page404")));
const OperationDashboard = LazyLoader(
  lazy(() => import("./content/OperationDashboard/Controller"))
);

const routes: RouteObject[] = [
  {
    path: "",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/model-navigator/:model/:version?",
        element: <ModelNavigator />,
      },
      {
        path: "/release-notes",
        element: <ReleaseNotes />,
      },
      {
        path: "/submissions",
        element: (
          <RequireAuth
            component={<Questionnaire />}
            redirectPath="/submissions"
            redirectName="Submission Requests"
          />
        ),
      },
      {
        path: "/data-submissions",
        element: (
          <RequireAuth
            component={<DataSubmissions />}
            redirectPath="/data-submissions"
            redirectName="Data Submissions"
          />
        ),
      },
      {
        path: "/data-submission/:submissionId/:tab?",
        element: (
          <RequireAuth
            component={<DataSubmissions />}
            redirectPath="/data-submission"
            redirectName="Data Submission"
          />
        ),
      },
      {
        path: "/submission/:appId/:section?",
        element: (
          <RequireAuth
            component={<Questionnaire />}
            redirectPath="/submissions"
            redirectName="Submission Requests"
          />
        ),
      },
      {
        path: "/users/:userId?",
        element: (
          <RequireAuth
            component={<Users key="users-view" type="users" />}
            redirectPath="/users"
            redirectName="User Management"
          />
        ),
      },
      {
        path: "/profile/:userId?",
        element: (
          <RequireAuth
            component={<Users key="profile-view" type="profile" />}
            redirectPath="/profile"
            redirectName="User Profile"
          />
        ),
      },
      {
        path: "/programs/:orgId?",
        element: (
          <RequireAuth
            component={<Organizations />}
            redirectPath="/programs"
            redirectName="Program Management"
          />
        ),
      },
      {
        path: "/studies/:studyId?",
        element: (
          <RequireAuth
            component={<Studies />}
            redirectPath="/studies"
            redirectName="Studies Management"
          />
        ),
      },
      {
        path: "/operation-dashboard",
        element: (
          <RequireAuth
            component={<OperationDashboard />}
            redirectPath="/operation-dashboard"
            redirectName="Operation Dashboard"
          />
        ),
      },
      {
        path: "*",
        element: <Status404 />,
      },
    ],
  },
];

export default routes;
