import type { Meta, StoryObj } from "@storybook/react";
import { Context as AuthContext, ContextState as AuthCtxState } from "../Contexts/AuthContext";
import { CrossValidationButton } from "./CrossValidationButton";

const meta = {
  title: "Data Submissions / CrossValidationButton",
  component: CrossValidationButton,
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  tags: ["autodocs"],
} satisfies Meta<typeof CrossValidationButton>;

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
      status: "Submitted",
      metadataValidationStatus: "New",
      fileValidationStatus: "New",
      fileErrors: [],
      history: [],
      conciergeName: "",
      conciergeEmail: "",
      intention: "New",
      createdAt: "",
      updatedAt: "",
      crossSubmissionStatus: null,
      otherSubmissions: JSON.stringify({
        Submitted: ["1", "2"],
      }),
    },
    onValidate: (r) => {
      // eslint-disable-next-line no-alert
      window.alert(`Validate result ${r}`);
    },
    variant: "contained",
    color: "info",
  },
  decorators: [
    (Story) => (
      <AuthContext.Provider value={{ user: { role: "Data Curator" } } as AuthCtxState}>
        <Story />
      </AuthContext.Provider>
    ),
  ],
};
