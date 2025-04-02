import type { Meta, StoryObj } from "@storybook/react";
import { MockedResponse } from "@apollo/client/testing";
import { within } from "@storybook/testing-library";
import Dialog from "./index";
import {
  LIST_APPROVED_STUDIES,
  LIST_INSTITUTIONS,
  ListApprovedStudiesInput,
  ListApprovedStudiesResp,
  ListInstitutionsResp,
} from "../../graphql";
import { Context as AuthContext, ContextState as AuthCtxState } from "../Contexts/AuthContext";
import { Roles } from "../../config/AuthRoles";

const meta: Meta<typeof Dialog> = {
  title: "Dialogs / Access Request",
  component: Dialog,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const studiesMock: MockedResponse<ListApprovedStudiesResp, ListApprovedStudiesInput> = {
  request: {
    query: LIST_APPROVED_STUDIES,
  },
  result: {
    data: {
      listApprovedStudies: {
        total: 2,
        studies: [
          {
            _id: "study-1",
            studyName: "Study-1",
            studyAbbreviation: "S1",
            controlledAccess: false,
            openAccess: false,
            dbGaPID: null,
            ORCID: "",
            originalOrg: null,
            PI: "",
            primaryContact: null,
            programs: [],
            createdAt: "",
          },
          {
            _id: "study-2",
            studyName: "Study-2",
            studyAbbreviation: "S2",
            controlledAccess: false,
            openAccess: false,
            dbGaPID: null,
            ORCID: "",
            originalOrg: null,
            PI: "",
            primaryContact: null,
            programs: [],
            createdAt: "",
          },
        ],
      },
    },
  },
  variableMatcher: () => true,
};

// TODO: Add input type here
const institutionsMock: MockedResponse<ListInstitutionsResp> = {
  request: {
    query: LIST_INSTITUTIONS,
  },
  result: {
    data: {
      listInstitutions: ["institution-1", "institution-2", "institution-3"],
    },
  },
};

export const Default: Story = {
  args: {
    role: "Submitter",
    permissions: ["access:request"],
  },
  argTypes: {
    role: {
      name: "Role",
      options: Roles,
      control: {
        type: "radio",
      },
    },
    permissions: {
      name: "Permissions",
      options: ["access:request"],
      control: {
        type: "check",
      },
    },
  },
  parameters: {
    apolloClient: {
      mocks: [studiesMock, institutionsMock],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    canvas.getByText("Request Access").click();

    await canvas.findByText("Request Access");
  },
  decorators: [
    (Story, context) => (
      <AuthContext.Provider
        value={
          {
            isLoggedIn: true,
            user: {
              firstName: "Example",
              role: context.args.role,
              permissions: context.args.permissions,
            } as User,
          } as AuthCtxState
        }
      >
        <Story />
      </AuthContext.Provider>
    ),
  ],
};
