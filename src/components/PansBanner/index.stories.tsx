import { MockedProvider } from "@apollo/client/testing";
import type { Meta, StoryObj } from "@storybook/react";

import { RETRIEVE_OMB_DETAILS } from "../../graphql";

import PansBanner from "./index";

const mockOMBDetails = {
  ombNumber: "0925-7775",
  expirationDate: "06/30/2025",
  content: [
    "Collection of this information is authorized by The Public Health Service Act, Section 411 (42 USC 285a). Rights of participants are protected by The Privacy Act of 1974. Participation is voluntary, and there are no penalties for not participating or withdrawing at any time. Refusal to participate will not affect your benefits in any way. The information collected will be kept private to the extent provided by law. Names and other identifiers will not appear in any report. Information provided will be combined for all participants and reported as summaries. You are being contacted online to complete this form so that NCI can consider your study for submission into the Cancer Research Data Commons.",
    "Public reporting burden for this collection of information is estimated to average 60 minutes per response, including the time for reviewing instructions, searching existing data sources, gathering and maintaining the data needed, and completing and reviewing the collection of information. An agency may not conduct or sponsor, and a person is not required to respond to, a collection of information unless it displays a currently valid OMB control number. Send comments regarding this burden estimate or any other aspect of this collection of information, including suggestions for reducing this burden to: NIH, Project Clearance Branch, 6705 Rockledge Drive, MSC 7974, Bethesda, MD 20892-7974, ATTN: PRA (0925-7775). Do not return the completed form to this address.",
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
