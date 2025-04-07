import React from "react";
import type { Decorator, Preview } from "@storybook/react";
import { MockedProvider } from "@apollo/client/testing";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { withThemeFromJSXProvider } from "@storybook/addon-themes";
import theme from "../src/theme";
import { HelmetWrapper } from "../src/layouts";
import StyledNotistackAlerts from "../src/components/StyledNotistackAlerts";

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
      MockedProvider,
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
  (Story) => (
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={10000}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      Components={{
        default: StyledNotistackAlerts,
        error: StyledNotistackAlerts,
        success: StyledNotistackAlerts,
      }}
      hideIconVariant
      preventDuplicate
    >
      <Story />
    </SnackbarProvider>
  )
];

export default preview;
