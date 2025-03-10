import type { Meta, StoryObj } from "@storybook/react";
import { Context as AuthContext, ContextState as AuthCtxState } from "../Contexts/AuthContext";
import Button from "./index";

const meta: Meta<typeof Button> = {
  title: "Submission Requests / Cancel & Restore Button",
  component: Button,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <AuthContext.Provider
        value={
          {
            isLoggedIn: true,
            user: {
              _id: "applicant-123",
              role: "Submitter",
              permissions: ["submission_request:cancel"],
            } as User,
          } as AuthCtxState
        }
      >
        <Story />
      </AuthContext.Provider>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The button that allows the user to restore an application.
 */
export const RestoreCanceled: Story = {
  name: "Restore (From Cancelled)",
  args: {
    application: {
      _id: "mock-id",
      status: "Canceled",
      createdAt: "",
      updatedAt: "",
      submittedDate: "",
      history: [],
      ORCID: "",
      applicant: {
        applicantID: "applicant-123",
        applicantName: "",
        applicantEmail: "",
      },
      PI: "",
      controlledAccess: false,
      openAccess: false,
      studyAbbreviation: "Mock Study that is canceled",
      conditional: false,
      pendingConditions: [],
      programName: "",
      programAbbreviation: "",
      programDescription: "",
      version: "",
    },
  },
  argTypes: {
    application: {
      control: {
        disable: true,
      },
    },
  },
};

/**
 * The button that allows the user to restore an application.
 */
export const RestoreDeleted: Story = {
  name: "Restore (From Deleted)",
  args: {
    application: {
      _id: "mock-id",
      status: "Deleted",
      createdAt: "",
      updatedAt: "",
      submittedDate: "",
      history: [],
      ORCID: "",
      applicant: {
        applicantID: "applicant-123",
        applicantName: "",
        applicantEmail: "",
      },
      PI: "",
      controlledAccess: false,
      openAccess: false,
      studyAbbreviation: "Mock Study that is deleted",
      conditional: false,
      pendingConditions: [],
      programName: "",
      programAbbreviation: "",
      programDescription: "",
      version: "",
    },
  },
  argTypes: {
    application: {
      control: {
        disable: true,
      },
    },
  },
};

/**
 * The button that's visible when the application is in a state that allows restoration.
 */
export const Cancel: Story = {
  args: {
    application: {
      _id: "mock-id",
      status: "In Progress",
      createdAt: "",
      updatedAt: "",
      submittedDate: "",
      history: [],
      ORCID: "",
      applicant: {
        applicantID: "applicant-123",
        applicantName: "",
        applicantEmail: "",
      },
      PI: "",
      controlledAccess: false,
      openAccess: false,
      studyAbbreviation: "Mock Study that is in progress",
      conditional: false,
      pendingConditions: [],
      programName: "",
      programAbbreviation: "",
      programDescription: "",
      version: "",
    },
  },
  argTypes: {
    application: {
      control: {
        disable: true,
      },
    },
  },
};
