import { Suspense, lazy, FC, ReactElement, useEffect } from 'react';
import { RouteObject } from 'react-router';
import { useNavigate } from 'react-router-dom';
import Layout from './layouts';
import SuspenseLoader from './components/SuspenseLoader';
import { useAuthContext } from './components/Contexts/AuthContext';

const Loader = (Component) => (props) => (
  <Suspense fallback={<SuspenseLoader />}>
    <Component {...props} />
  </Suspense>
);

type RequireAuthProps = {
  component: ReactElement;
  redirectPath: string;
  redirectName: string;
};

const RequireAuth: FC<RequireAuthProps> = ({ component, redirectPath, redirectName }: RequireAuthProps) => {
  const authenticated = useAuthContext().isLoggedIn;
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticated) {
      navigate("/", { state: { path: redirectPath, name: redirectName } });
    }
  }, [authenticated]);

  return component;
};

// Pages
const Home = Loader(lazy(() => import('./content')));
const Login = Loader(lazy(() => import('./content/login/Controller')));
const Questionnaire = Loader(lazy(() => import('./content/questionnaire/Controller')));
const Users = Loader(lazy(() => import('./content/users/Controller')));
const OtherResources = Loader(lazy(() => import('./content/static/OtherResources')));
const Search = Loader(lazy(() => import('./content/search')));

// Status Pages
const Status404 = Loader(lazy(() => import('./content/status/Page404')));

const routes: RouteObject[] = [
  {
    path: '',
    element: <Layout />,
    children: [
      {
        path: '/:redirect?',
        element: <Home />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/submissions',
        element: <RequireAuth component={<Questionnaire />} redirectPath="/submissions" redirectName="Submission Requests" />
      },
      {
        path: '/dataSubmissionsTodo',
        element: <RequireAuth component={<Status404 />} redirectPath="/dataSubmissionsTodo" redirectName="Data Submissions" />
      },
      {
        path: '/submission/:appId/:section?',
        element: <Questionnaire />
      },
      {
        path: '/users/:userId?',
        element: <RequireAuth component={<Users />} redirectPath="/users" redirectName="User Management" />
      },
      {
        path: '/sitesearch/:keyword',
        element: <Search />
      },
      {
        path: '/or',
        element: <OtherResources />
      },
      {
        path: '*',
        element: <Status404 />
      },
    ]
  }
];

export default routes;
