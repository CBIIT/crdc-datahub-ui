import type { Meta, StoryObj } from "@storybook/react";
import DataSubmissionSummary from "./DataSubmissionSummary";

const meta = {
  title: "Data Submissions / Summary",
  component: DataSubmissionSummary,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DataSubmissionSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseSubmission: Submission = {
  _id: "",
  name: "Demo Submission",
  submitterID: "",
  submitterName: "Demo User",
  organization: {
    _id: "",
    name: "Demo Organization",
  },
  dataCommons: "CDS",
  modelVersion: "",
  studyAbbreviation: "DEMO",
  dbGaPID: "",
  bucketName: "",
  rootPath: "",
  status: "In Progress",
  metadataValidationStatus: "New",
  fileValidationStatus: "New",
  fileErrors: [],
  history: [],
  conciergeName: "Ex. Concierge",
  conciergeEmail: "example@example.com",
  intention: "New",
  createdAt: "",
  updatedAt: "",
  crossSubmissionStatus: "New",
  otherSubmissions: "",
};

export const Summary: Story = {
  args: {
    dataSubmission: {
      ...baseSubmission,
      history: [
        {
          status: "New",
          dateTime: "2022-02-28T00:00:00.000Z",
          userID: "",
        },
        {
          status: "In Progress",
          dateTime: "2022-03-01T00:00:00.000Z",
          userID: "",
        },
      ],
    },
  },
};

export const ReviewComments: Story = {
  args: {
    dataSubmission: {
      ...baseSubmission,
      status: "Rejected",
      history: [
        {
          status: "In Progress",
          dateTime: "2022-02-28T00:00:00.000Z",
          userID: "",
        },
        {
          status: "Rejected",
          dateTime: "2022-03-01T00:00:00.000Z",
          userID: "",
          reviewComment: "Example review comment here",
        },
      ],
    },
  },
};
