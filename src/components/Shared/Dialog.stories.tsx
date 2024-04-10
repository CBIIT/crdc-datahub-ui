import type { Meta, StoryObj } from "@storybook/react";
import Dialog from "./Dialog";

const meta = {
  title: "General / Dialog",
  component: Dialog,
  parameters: {
    layout: "fullscreen",
  },
  // tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Example Title",
    message: "Example dialog content message",
    open: true,
    onClose: () => {},
  },
};
