import { Suspense, lazy } from 'react';
import { RouteObject } from 'react-router';
import Layout from './layouts';
import SuspenseLoader from './components/SuspenseLoader';

const Loader = (Component) => (props) => (
  <Suspense fallback={<SuspenseLoader />}>
    <Component {...props} />
  </Suspense>
);

// Pages
const Home = Loader(lazy(() => import('./content')));
const Login = Loader(lazy(() => import('./content/login/Controller')));
const Questionnaire = Loader(lazy(() => import('./content/questionnaire/Controller')));
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
        path: '/',
        element: <Home />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/submissions',
        element: <Questionnaire />
      },
      {
        path: '/submission/:appId?/:section?',
        element: <Questionnaire />
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
