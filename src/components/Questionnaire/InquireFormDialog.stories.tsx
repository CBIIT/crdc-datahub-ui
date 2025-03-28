import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import InquireFormDialog from "./InquireFormDialog";

const meta: Meta<typeof InquireFormDialog> = {
  title: "Submission Requests / Review Comments / Inquire Dialog",
  component: InquireFormDialog,
} satisfies Meta<typeof InquireFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    onSubmit: fn(),
    onCancel: fn(),
  },
};
