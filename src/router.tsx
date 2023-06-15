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
const Questionnaire = Loader(lazy(() => import('./content/questionnaire/Controller')));

// status
const Status404 = Loader(
  lazy(() => import('./content/status/Page404'))
);

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
        path: '/questionnaire/:appId?/:section?',
        element: <Questionnaire />
      },
      {
        path: '*',
        element: <Status404 />
      }
    ]
  }
];

export default routes;
