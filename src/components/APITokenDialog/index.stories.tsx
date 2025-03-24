import type { Meta, StoryObj } from "@storybook/react";
import { MockedResponse } from "@apollo/client/testing";
import Dialog from "./index";
import { GRANT_TOKEN, GrantTokenResp } from "../../graphql";

const meta = {
  title: "Dialogs / API Token",
  component: Dialog,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockGrantToken: MockedResponse<GrantTokenResp> = {
  request: {
    query: GRANT_TOKEN,
  },
  result: {
    data: {
      grantToken: {
        tokens: ["fake-api-token-example"],
        message: null,
      },
    },
  },
};

export const Default: Story = {
  args: {
    open: true,
    onClose: () => {},
  },
  parameters: {
    apolloClient: {
      mocks: [mockGrantToken],
    },
  },
};
