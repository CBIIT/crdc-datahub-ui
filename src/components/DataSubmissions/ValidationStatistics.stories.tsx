import type { Meta, StoryObj } from "@storybook/react";
import ValidationStatistics from "./ValidationStatistics";

type CustomStoryProps = React.ComponentProps<typeof ValidationStatistics>;

const meta: Meta<CustomStoryProps> = {
  title: "Data Submissions / Validation Statistics",
  component: ValidationStatistics,
  tags: ["autodocs"],
  argTypes: {
    dataSubmission: {
      control: false,
    },
    statistics: {
      control: false,
    },
  },
} satisfies Meta<CustomStoryProps>;

type Story = StoryObj<CustomStoryProps>;

const mockData: SubmissionStatistic[] = [
  {
    nodeName: "mock-node",
    total: 200,
    new: 50,
    passed: 50,
    warning: 50,
    error: 50,
  },
  {
    nodeName: "mock-node-2",
    total: 75,
    new: 10,
    passed: 50,
    warning: 15,
    error: 0,
  },
  {
    nodeName: "mock-node-3",
    total: 300,
    new: 0,
    passed: 0,
    warning: 0,
    error: 300,
  },
  {
    nodeName: "mock-node-4",
    total: 150,
    new: 125,
    passed: 25,
    warning: 0,
    error: 0,
  },
  {
    nodeName: "mock-node-5",
    total: 400,
    new: 380,
    passed: 0,
    warning: 20,
    error: 0,
  },
  {
    nodeName: "mock-node-6",
    total: 100,
    new: 50,
    passed: 50,
    warning: 0,
    error: 0,
  },
];

export const Default: Story = {
  args: {
    dataSubmission: {
      _id: "mock id",
    } as Submission,
    statistics: [...mockData],
  },
};

export const NoData: Story = {
  args: {
    dataSubmission: {
      _id: "mock id",
    } as Submission,
    statistics: [],
  },
};

export const Loading: Story = {
  args: {},
};

export default meta;
