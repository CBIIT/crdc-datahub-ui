import type { Meta, StoryObj } from "@storybook/react";
import GenericAlert from ".";

const meta = {
  title: "General / GenericAlert",
  component: GenericAlert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    severity: { control: "radio", options: ["success", "error"] },
    children: { control: "text" },
  },
} satisfies Meta<typeof GenericAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    open: true,
    severity: "success",
    children: "This is a success alert message",
  },
};

export const Error: Story = {
  args: {
    open: true,
    severity: "error",
    children: "This is an error alert message",
  },
};
