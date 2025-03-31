import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import RejectFormDialog from "./RejectFormDialog";

const meta: Meta<typeof RejectFormDialog> = {
  title: "Submission Requests / Review Comments / Reject Dialog",
  component: RejectFormDialog,
} satisfies Meta<typeof RejectFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    onSubmit: fn(),
    onCancel: fn(),
  },
};
