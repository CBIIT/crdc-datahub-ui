import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import _ from "lodash";
import App from "./App";
import client from "./client";
import { AuthProvider } from "./components/Contexts/AuthContext";
import { AnalyticsProvider } from "./components/Contexts/AnalyticsContext";
import env from "./env";

// Required for DMN to work properly
globalThis._ = _;

if (env.VITE_DEV_TIER === "dev" || env.VITE_DEV_TIER === "dev2") {
  import("@axe-core/react").then(({ default: axe }) => axe(React, ReactDOM, 1500));
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <AnalyticsProvider GA_MEASUREMENT_ID={env.VITE_GA_TRACKING_ID}>
          <App />
        </AnalyticsProvider>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
);
