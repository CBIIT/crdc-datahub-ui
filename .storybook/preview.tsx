import React from "react";
import type { Preview, Decorator } from "@storybook/react";
import { MockedProvider } from "@apollo/client/testing";
import { withTests } from "@storybook/addon-jest";
import { HelmetProvider } from "react-helmet-async";
import { CssBaseline, ThemeProvider } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import theme from '../src/theme';
import { HelmetWrapper } from '../src/layouts';
import results from "../.jest-results.json";
import { MemoryRouter } from "react-router-dom";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {},
    },
    apolloClient: {
      MockedProvider,
    },
  },
};

export const decorators: Decorator[] = [
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
    <MemoryRouter>
      <HelmetProvider>
        <HelmetWrapper />
        <Story />
      </HelmetProvider>
    </MemoryRouter>
  ),
];

export default preview;
