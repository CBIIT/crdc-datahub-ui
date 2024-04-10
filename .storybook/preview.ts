import type { Preview } from "@storybook/react";
import { MockedProvider } from "@apollo/client/testing";
import { withTests } from "@storybook/addon-jest";
import { CssBaseline, ThemeProvider } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import theme from '../src/theme';
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
  })
];

export default preview;
