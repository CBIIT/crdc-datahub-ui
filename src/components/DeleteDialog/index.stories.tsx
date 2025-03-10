import type { Meta, StoryObj } from "@storybook/react";
import Dialog from "./index";

const meta = {
  title: "Dialogs / Delete",
  component: Dialog,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    header: "Dialog Title",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    confirmText: "Confirm",
    onClose: () => {},
    onConfirm: () => {},
  },
};
