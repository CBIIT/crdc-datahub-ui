import type { Preview } from "@storybook/react";
import { MockedProvider } from "@apollo/client/testing";
import { withTests } from "@storybook/addon-jest";

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
];

export default preview;
