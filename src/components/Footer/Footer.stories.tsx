import type { Meta, StoryObj } from "@storybook/react";
import Header from "./index";

const meta = {
  title: "General / Footer",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicDesktop: Story = {
  args: {},
};
