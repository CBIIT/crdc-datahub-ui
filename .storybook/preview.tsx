import React from 'react';
import type { Decorator, Preview } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing';
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import theme from '../src/theme';
import { HelmetWrapper } from '../src/layouts';

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        date: /Date$/i,
      },
      disableSave: true,
    },
    apolloClient: {
      MockedProvider
    },
  },
};

export const decorators: Decorator[] = [
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
