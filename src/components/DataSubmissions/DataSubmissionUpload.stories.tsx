import type { Meta, StoryObj } from "@storybook/react";
import DataSubmissionUpload from "./DataSubmissionUpload";
import { Context as AuthContext, ContextState as AuthCtxState } from "../Contexts/AuthContext";

const meta = {
  title: "Data Submissions / Metadata Upload",
  component: DataSubmissionUpload,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <AuthContext.Provider
        value={
          { isLoggedIn: true, user: { _id: "demo_id", role: "Submitter" } as User } as AuthCtxState
        }
      >
        <Story />
      </AuthContext.Provider>
    ),
  ],
} satisfies Meta<typeof DataSubmissionUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseSubmission: Submission = {
  _id: "",
  name: "Demo Submission",
  submitterID: "demo_id",
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
};

export const MetadataUpload: Story = {
  args: {
    submission: {
      ...baseSubmission,
    },
    onCreateBatch: () => {},
    onUpload: () => {},
  },
};

export const NewUnlocked: Story = {
  args: {
    submission: {
      ...baseSubmission,
      metadataValidationStatus: null,
      fileValidationStatus: null,
    },
    onCreateBatch: () => {},
    onUpload: () => {},
  },
};

export const Readonly: Story = {
  args: {
    submission: {
      ...baseSubmission,
      status: "Submitted",
    },
    onCreateBatch: () => {},
    onUpload: () => {},
    readOnly: true,
  },
};
