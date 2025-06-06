import type { Meta, StoryObj } from "@storybook/react";
import { screen, userEvent, waitFor, within, expect, fn } from "@storybook/test";
import { MockedResponse } from "@apollo/client/testing";
import { Context as AuthContext, ContextState as AuthCtxState } from "../Contexts/AuthContext";
import { Context as FormContext, Status as FormStatus } from "../Contexts/FormContext";
import Button from "./index";
import { CANCEL_APP, CancelAppInput, CancelAppResp } from "../../graphql";

const mockCancelApp: MockedResponse<CancelAppResp, CancelAppInput> = {
  request: {
    query: CANCEL_APP,
  },
  variableMatcher: () => true,
  result: {
    data: {
      cancelApplication: {
        _id: "mock-uuid-1234",
      },
    },
  },
};

const meta: Meta<typeof Button> = {
  title: "Submission Requests / Cancel Application Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    onCancel: fn(),
  },
  parameters: {
    apolloClient: {
      mocks: [mockCancelApp],
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
    (Story) => (
      <FormContext.Provider
        value={{
          status: FormStatus.LOADED,
          data: {
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
            studyAbbreviation: "MOCK-STUDY",
            conditional: false,
            pendingConditions: [],
            programName: "",
            programAbbreviation: "",
            programDescription: "",
            version: "",
            questionnaireData: null,
          },
        }}
      >
        <Story />
      </FormContext.Provider>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The button that's visible when the application is in a state that allows restoration.
 */
export const CancelButton: Story = {
  name: "Button",
  parameters: meta.parameters,
};

/**
 * The dialog confirmation that appears when the user clicks the cancel button.
 */
export const CancelConfirmDialog: Story = {
  name: "Dialog",
  parameters: meta.parameters,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button", { name: /cancel/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const reasonInput = within(screen.getByRole("dialog")).queryByTestId(
      "cancel-application-reason"
    );

    await userEvent.type(reasonInput, "lorem ipsum dol excel ".repeat(10));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /confirm/i })).toBeEnabled();
    });
  },
};
