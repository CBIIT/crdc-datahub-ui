import type { Meta, StoryObj } from "@storybook/react";
import PansBanner from "./index";

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
};
