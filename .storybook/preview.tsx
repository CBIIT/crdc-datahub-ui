import React from "react";
import type { Preview } from "@storybook/react";
import { MockedProvider } from "@apollo/client/testing";
import { withTests } from "@storybook/addon-jest";
import { HelmetProvider } from "react-helmet-async";
import { CssBaseline, ThemeProvider } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import theme from '../src/theme';
import { HelmetWrapper } from '../src/layouts';
import results from "../.jest-results.json";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    apolloClient: {
      MockedProvider,
    },
  },
};

export const decorators = [
  withTests({
    results,
  }),
  withThemeFromJSXProvider({
    themes: {
      default: theme,
    },
    defaultTheme: "default",
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
  (Story) => (
    <HelmetProvider>
      <HelmetWrapper />
      <Story />
    </HelmetProvider>
  )
];

export default preview;
