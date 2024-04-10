import type { Meta, StoryObj } from "@storybook/react";
import ReviewCommentsDialog from "./ReviewCommentsDialog";

const meta = {
  title: "General / ReviewCommentsDialog",
  component: ReviewCommentsDialog,
  parameters: {
    layout: "fullscreen",
  },
  // tags: ["autodocs"],
} satisfies Meta<typeof ReviewCommentsDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    status: "Example Status",
    lastReview: {
      status: "Example Status",
      dateTime: "2024-01-01T08:00:00.000Z",
      reviewComment: "Example Review Comment",
      userID: "-",
    },
    title: "Pre Dialog Title",
    onClose: () => {},
  },
};
