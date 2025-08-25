import { MockedResponse } from "@apollo/client/testing";
import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within } from "@storybook/test";

import { authCtxStateFactory } from "@/factories/auth/AuthCtxStateFactory";
import { userFactory } from "@/factories/auth/UserFactory";
import { submissionCtxStateFactory } from "@/factories/submission/SubmissionContextFactory";
import { submissionFactory } from "@/factories/submission/SubmissionFactory";

import { Roles } from "../../config/AuthRoles";
import {
  LIST_POTENTIAL_COLLABORATORS,
  ListPotentialCollaboratorsInput,
  ListPotentialCollaboratorsResp,
  UPDATE_MODEL_VERSION,
  UpdateModelVersionInput,
  UpdateModelVersionResp,
} from "../../graphql";
import { Context as AuthContext } from "../Contexts/AuthContext";
import { SubmissionContext, SubmissionCtxStatus } from "../Contexts/SubmissionContext";

import Button from "./index";

const mockDC = "MOCK-DC";

type CustomStoryProps = React.ComponentProps<typeof Button> & {
  userRole: UserRole;
  permissions: AuthPermissions[];
  status: SubmissionStatus;
};

const meta: Meta<CustomStoryProps> = {
  title: "Data Submissions / Update Submission Dialog",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    status: {
      description: "Status of the submission",
      control: "select",
      options: ["New", "In Progress", "Submitted"],
    },
    userRole: {
      description: "Role of the user",
      control: "select",
      options: Roles,
    },
    permissions: {
      description: "Permissions assigned to the user",
      control: "check",
      options: ["data_submission:review"],
    },
  },
  decorators: [
    (Story, context) => (
      <AuthContext.Provider
        value={authCtxStateFactory.build({
          user: userFactory.build({
            _id: "current-user",
            dataCommons: [mockDC],
            dataCommonsDisplayNames: [mockDC],
            role: context.args.userRole,
            permissions: context.args.permissions,
          }),
        })}
      >
        <Story />
      </AuthContext.Provider>
    ),
    (Story, context) => (
      <SubmissionContext.Provider
        value={submissionCtxStateFactory.build({
          data: {
            getSubmission: submissionFactory.build({
              _id: "",
              submitterID: "current-user",
              submitterName: "Test User",
              dataCommons: mockDC,
              dataCommonsDisplayName: "A Mock Data Commons",
              crossSubmissionStatus: null,
              otherSubmissions: null,
              intention: "New/Update",
              dataType: "Metadata and Data Files",
              validationStarted: "",
              validationEnded: "",
              validationScope: "New",
              validationType: ["metadata", "file"],
              metadataValidationStatus: "New",
              fileValidationStatus: "New",
              dataFileSize: null,
              modelVersion: "3.0.0",
              status: context.args.status,
            }),
            submissionStats: null,
            getSubmissionAttributes: null,
          },
          updateQuery: fn(),
          status: SubmissionCtxStatus.LOADED,
          error: null,
        })}
      >
        <Story />
      </SubmissionContext.Provider>
    ),
    (Story) => {
      sessionStorage.setItem(
        "manifest",
        JSON.stringify({
          [mockDC]: {
            "model-files": [],
            versions: ["6.1.2", "5.0.4", "3.0.0", "1.9.2"],
          },
        })
      );

      return <Story />;
    },
  ],
} satisfies Meta<CustomStoryProps>;

type Story = StoryObj<CustomStoryProps>;

const mockUpdateQuery: MockedResponse<UpdateModelVersionResp, UpdateModelVersionInput> = {
  request: {
    query: UPDATE_MODEL_VERSION,
  },
  variableMatcher: () => true,
  result: {
    data: {
      updateSubmissionModelVersion: {
        _id: "",
        modelVersion: "API RESPONSE VERSION",
      },
    },
  },
};

const mockListCollaborators: MockedResponse<
  ListPotentialCollaboratorsResp,
  ListPotentialCollaboratorsInput
> = {
  request: {
    query: LIST_POTENTIAL_COLLABORATORS,
  },
  variableMatcher: () => true,
  result: {
    data: {
      listPotentialCollaborators: userFactory
        .pick(["_id", "firstName", "lastName"])
        .build(5, (idx) => ({
          _id: `user-${idx + 1}`,
          firstName: `First ${idx + 1}`,
          lastName: `Last ${idx + 1}`,
        })),
    },
  },
};

export const Default: Story = {
  args: {
    userRole: "Data Commons Personnel",
    permissions: ["data_submission:review"],
    status: "In Progress",
  },
  parameters: {
    apolloClient: {
      mocks: [mockUpdateQuery, mockListCollaborators],
    },
  },
};

/**
 * A story to cover the hover state of the button.
 *
 * Note: The :hover state cannot truly be simulated programmatically, so the background won't be visible
 * until you hover over the button.
 */
export const Hovered: Story = {
  args: {
    userRole: "Data Commons Personnel",
    permissions: ["data_submission:review"],
    status: "In Progress",
  },
  parameters: {
    apolloClient: {
      mocks: [mockUpdateQuery, mockListCollaborators],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = await canvas.findByRole("button");

    await userEvent.hover(button);
  },
};

export default meta;
