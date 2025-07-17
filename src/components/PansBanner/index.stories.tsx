import { MockedProvider } from "@apollo/client/testing";
import type { Meta, StoryObj } from "@storybook/react";

import { RETRIEVE_OMB_DETAILS } from "../../graphql";

import PansBanner from "./index";

const mockOMBDetails = {
  ombNumber: "1234-5678",
  expirationDate: "06/30/2025",
  content: [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
  ],
};

const successMock = {
  request: {
    query: RETRIEVE_OMB_DETAILS,
  },
  result: {
    data: {
      retrieveOMBDetails: mockOMBDetails,
    },
  },
};

const delayedMock = {
  request: {
    query: RETRIEVE_OMB_DETAILS,
  },
  result: {
    data: {
      retrieveOMBDetails: mockOMBDetails,
    },
  },
  delay: 2000, // 2 second delay to show loading state
};

const errorMock = {
  request: {
    query: RETRIEVE_OMB_DETAILS,
  },
  error: new Error("Failed to fetch OMB details"),
};

const meta: Meta<typeof PansBanner> = {
  title: "Miscellaneous / PANS Banner",
  component: PansBanner,
  args: {},
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => {
      sessionStorage.clear();

      return <Story />;
    },
  ],
} satisfies Meta<typeof PansBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => (
      <MockedProvider mocks={[successMock]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
};

export const Loading: Story = {
  args: {},
  decorators: [
    (Story) => (
      <MockedProvider mocks={[delayedMock]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
};

export const ErrorState: Story = {
  args: {},
  decorators: [
    (Story) => (
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
};
