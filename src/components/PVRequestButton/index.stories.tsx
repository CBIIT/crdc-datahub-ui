import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, fn } from "@storybook/test";

import { submissionCtxStateFactory } from "@/factories/submission/SubmissionContextFactory";
import { submissionFactory } from "@/factories/submission/SubmissionFactory";

import { SubmissionContext, SubmissionCtxStatus } from "../Contexts/SubmissionContext";

import Button, { PVRequestButtonProps } from "./index";

const meta: Meta<PVRequestButtonProps> = {
  title: "Data Submissions / PV Request Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    onSubmit: fn(),
    nodeName: "mock-node",
    offendingProperty: "mock-property",
    offendingValue: "mock-value",
  },
  parameters: {
    apolloClient: {
      mocks: [],
    },
  },
  decorators: [
    (Story) => (
      <SubmissionContext.Provider
        value={submissionCtxStateFactory.build({
          data: {
            getSubmission: submissionFactory.build({
              _id: "mock-submission-id",
            }),
            submissionStats: null,
            getSubmissionAttributes: null,
          },
          updateQuery: fn(),
          status: SubmissionCtxStatus.LOADED,
          error: null,
        })}
      >
        <Story />
      </SubmissionContext.Provider>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The standard button that's enabled and visible
 */
export const DefaultButton: Story = {
  name: "Button",
  parameters: meta.parameters,
};

/**
 * The standard button that's disabled but visible
 */
export const DisabledButton: Story = {
  name: "Button Disabled",
  args: {
    disabled: true,
  },
  parameters: meta.parameters,
};

/**
 * The dialog confirmation that appears when the user clicks the button.
 */
export const ButtonConfirmDialog: Story = {
  name: "Dialog",
  parameters: meta.parameters,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button", { name: /Request New PV/i });
    await userEvent.click(button);

    // await waitFor(() => {
    //   expect(screen.getByRole("dialog")).toBeInTheDocument();
    // });

    // const reasonInput = within(screen.getByRole("dialog")).queryByTestId(
    //   "cancel-application-reason"
    // );

    // await userEvent.type(reasonInput, "lorem ipsum dol excel ".repeat(10));

    // await waitFor(() => {
    //   expect(screen.getByRole("button", { name: /confirm/i })).toBeEnabled();
    // });
  },
};
