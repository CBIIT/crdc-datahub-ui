import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ApolloProvider } from '@apollo/client';
import axe from '@axe-core/react';
import App from './App';
import client from './client';
import * as serviceWorker from './serviceWorker';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './components/Contexts/AuthContext';

if (process.env.NODE_ENV !== "production") {
  axe(React, ReactDOM, 1000);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <ApolloProvider client={client}>
    <HelmetProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HelmetProvider>
  </ApolloProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

serviceWorker.unregister();
