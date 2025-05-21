import type { Meta, StoryObj } from "@storybook/react";
import { fn, expect } from "@storybook/test";
import { MockedResponse } from "@apollo/client/testing";
import { screen, userEvent, waitFor, within } from "@storybook/testing-library";
import { Context as AuthContext, ContextState as AuthCtxState } from "../Contexts/AuthContext";
import Button from "./index";
import {
  CANCEL_APP,
  CancelAppInput,
  CancelAppResp,
  RESTORE_APP,
  RestoreAppInput,
  RestoreAppResp,
} from "../../graphql";

const mockCancelApp: MockedResponse<CancelAppResp, CancelAppInput> = {
  request: {
    query: CANCEL_APP,
  },
  variableMatcher: () => true,
  result: {
    data: {
      cancelApplication: {
        _id: "some id",
      },
    },
  },
};

const mockRestoreApp: MockedResponse<RestoreAppResp, RestoreAppInput> = {
  request: {
    query: RESTORE_APP,
  },
  variableMatcher: () => true,
  result: {
    data: {
      restoreApplication: {
        _id: "some id",
      },
    },
  },
};

const meta: Meta<typeof Button> = {
  title: "Submission Requests / ToggleApplicationButton",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    apolloClient: {
      mocks: [mockCancelApp, mockRestoreApp],
    },
  },
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
  name: "Restore (From Canceled)",
  args: {
    onCancel: fn(),
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
    onCancel: fn(),
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

export const RestoreDialog: Story = {
  name: "Restore Confirmation Dialog",
  args: {
    onCancel: fn(),
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button", { name: /restore/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const reasonInput = within(screen.getByRole("dialog")).queryByTestId(
      "cancel-restore-application-reason"
    );

    await userEvent.type(reasonInput, "lorem ipsum dol excel ".repeat(10));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /confirm/i })).toBeEnabled();
    });
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
    onCancel: fn(),
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

export const CancelConfirmDialog: Story = {
  name: "Cancel Confirmation Dialog",
  args: {
    onCancel: fn(),
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button", { name: /cancel/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const reasonInput = within(screen.getByRole("dialog")).queryByTestId(
      "cancel-restore-application-reason"
    );

    await userEvent.type(reasonInput, "lorem ipsum dol excel ".repeat(10));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /confirm/i })).toBeEnabled();
    });
  },
  argTypes: {
    application: {
      control: {
        disable: true,
      },
    },
  },
};
