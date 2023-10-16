import React from "react";
import { Provider } from "react-redux";
import NavigatorView from "./NavigatorView";
import store from "./utils/ReduxStore";
import ErrorBoundary from '../../components/ErrorBoundary';

export default () => (
  <Provider store={store}>
    <ErrorBoundary errorMessage="Unable to load the Data Submission Templates">
      <NavigatorView />
    </ErrorBoundary>
  </Provider>
);
