import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ApolloProvider } from '@apollo/client';
import axe from '@axe-core/react';
import App from './App';
import client from './client';
import * as serviceWorker from './serviceWorker';
import { AuthProvider } from './components/Contexts/AuthContext';
import { AnalyticsProvider } from './components/Contexts/AnalyticsContext';
import env from './env';

if (env.REACT_APP_DEV_TIER === "dev" || env.REACT_APP_DEV_TIER === "dev2") {
  axe(React, ReactDOM, 1500);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <HelmetProvider>
        <AuthProvider>
          <AnalyticsProvider GA_MEASUREMENT_ID={env.REACT_APP_GA_TRACKING_ID}>
            <App />
          </AnalyticsProvider>
        </AuthProvider>
      </HelmetProvider>
    </ApolloProvider>
  </React.StrictMode>,
);

serviceWorker.unregister();
