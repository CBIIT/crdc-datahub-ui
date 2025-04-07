import type { Meta, StoryObj } from "@storybook/react";
import StudyList from "./index";

const meta: Meta<typeof StudyList> = {
  title: "Miscellaneous / StudyList",
  component: StudyList,
  tags: ["autodocs"],
} satisfies Meta<typeof StudyList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: {
    studies: [{ _id: "study-1", studyName: "Study One" }],
  },
};

export const Multiple: Story = {
  args: {
    studies: [
      { _id: "study-1", studyName: "Study One" },
      { _id: "study-2", studyName: "Study Two" },
      { _id: "study-3", studyName: "Study Three" },
    ],
  },
};

export const AllStudies: Story = {
  args: {
    studies: [{ _id: "All" }],
  },
};

export const None: Story = {
  args: {
    studies: [],
  },
};
