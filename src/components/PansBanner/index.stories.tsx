import type { Meta, StoryObj } from "@storybook/react";
import { MockedProvider } from "@apollo/client/testing";
import PansBanner from "./index";
import { GET_OMB_BANNER } from "../../graphql";

const mockOmbData = {
  ombNumber: "0925-7775",
  expirationDate: "06/30/2025",
  content:
    "Collection of this information is authorized by The Public Health Service Act, Section 411 (42 USC 285a). Rights of participants are protected by The Privacy Act of 1974. Participation is voluntary, and there are no penalties for not participating or withdrawing at any time.\n\nPublic reporting burden for this collection of information is estimated to average 60 minutes per response, including the time for reviewing instructions, searching existing data sources, gathering and maintaining the data needed, and completing and reviewing the collection of information.",
};

const alternateOmbData = {
  ombNumber: "0925-9999",
  expirationDate: "12/31/2026",
  content:
    "This is an example of updated OMB content that demonstrates the dynamic nature of the banner system.\n\nThe content can be modified without requiring a code deployment, allowing for more agile updates to comply with government requirements.",
};

const successMock = {
  request: {
    query: GET_OMB_BANNER,
  },
  result: {
    data: {
      getOmbBanner: mockOmbData,
    },
  },
};

const alternateMock = {
  request: {
    query: GET_OMB_BANNER,
  },
  result: {
    data: {
      getOmbBanner: alternateOmbData,
    },
  },
};

const errorMock = {
  request: {
    query: GET_OMB_BANNER,
  },
  error: new Error("Failed to fetch OMB data"),
};

const loadingMock = {
  request: {
    query: GET_OMB_BANNER,
  },
  delay: 30000, // Long delay to show loading state
  result: {
    data: {
      getOmbBanner: mockOmbData,
    },
  },
};

const meta: Meta<typeof PansBanner> = {
  title: "Miscellaneous / PANS Banner",
  component: PansBanner,
  args: {},
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story, { parameters }) => {
      sessionStorage.clear();

      const mocks = parameters?.apolloMocks || [successMock];

      return (
        <MockedProvider mocks={mocks} addTypename={false}>
          <Story />
        </MockedProvider>
      );
    },
  ],
} satisfies Meta<typeof PansBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    apolloMocks: [successMock],
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    apolloMocks: [loadingMock],
  },
};

export const ErrorFallback: Story = {
  args: {},
  parameters: {
    apolloMocks: [errorMock],
  },
};

export const AlternateContent: Story = {
  args: {},
  parameters: {
    apolloMocks: [alternateMock],
  },
};
