import type { Meta, StoryObj } from "@storybook/react";
import { ExportValidationButton } from "./ExportValidationButton";

const meta = {
  title: "Data Submissions / ExportValidationButton",
  component: ExportValidationButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ExportValidationButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Button: Story = {
  args: {
    submission: {
      _id: "",
      name: "",
      submitterID: "",
      submitterName: "",
      organization: undefined,
      dataCommons: "",
      modelVersion: "",
      studyAbbreviation: "",
      dbGaPID: "",
      bucketName: "",
      rootPath: "",
      status: "New",
      metadataValidationStatus: "New",
      fileValidationStatus: "New",
      fileErrors: [],
      history: [],
      conciergeName: "",
      conciergeEmail: "",
      intention: "New/Update",
      dataType: "Metadata and Data Files",
      createdAt: "",
      updatedAt: "",
      crossSubmissionStatus: "New",
      otherSubmissions: "",
      studyID: "",
      deletingData: false,
      validationStarted: "",
      validationEnded: "",
      validationScope: "New",
      validationType: [],
    },
    fields: {
      "Batch ID": (d) => d.displayID,
    },
  },
};
