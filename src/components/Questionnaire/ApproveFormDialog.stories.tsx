import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import ApproveFormDialog from "./ApproveFormDialog";

const meta: Meta<typeof ApproveFormDialog> = {
  title: "Submission Requests / Review Comments / Approve Dialog",
  component: ApproveFormDialog,
} satisfies Meta<typeof ApproveFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    onSubmit: fn(),
    onCancel: fn(),
  },
};
