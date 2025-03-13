import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  Context as AuthContext,
  ContextState as AuthCtxState,
  Status as AuthStatus,
} from "../Contexts/AuthContext";
import Button from "./index";
import { Roles } from "../../config/AuthRoles";
import { SubmissionContext, SubmissionCtxStatus } from "../Contexts/SubmissionContext";
import { GetSubmissionResp } from "../../graphql";

type CustomStoryProps = React.ComponentProps<typeof Button> & {
  userRole: UserRole;
  permissions: AuthPermissions[];
  status: SubmissionStatus;
};

const meta: Meta<CustomStoryProps> = {
  title: "Data Submissions / Model Selection",
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
        value={{
          ...baseContext,
          user: {
            ...baseUser,
            role: context.args.userRole,
            permissions: context.args.permissions,
          },
        }}
      >
        <Story />
      </AuthContext.Provider>
    ),
    (Story, context) => (
      <SubmissionContext.Provider
        value={{
          data: {
            getSubmission: {
              ...baseSubmission,
              modelVersion: "6.1.2",
              status: context.args.status,
            },
          } as GetSubmissionResp,
          updateQuery: fn(),
          status: SubmissionCtxStatus.LOADED,
          error: null,
        }}
      >
        <Story />
      </SubmissionContext.Provider>
    ),
    (Story) => {
      sessionStorage.setItem(
        "manifest",
        JSON.stringify({
          "MOCK-DC": {
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

const baseSubmission: Omit<Submission, "status"> = {
  _id: "",
  name: "",
  submitterID: "current-user",
  submitterName: "",
  organization: null,
  dataCommons: "MOCK-DC",
  modelVersion: "",
  studyAbbreviation: "",
  dbGaPID: "",
  bucketName: "",
  rootPath: "",
  crossSubmissionStatus: null,
  fileErrors: [],
  history: [],
  otherSubmissions: null,
  conciergeName: "",
  conciergeEmail: "",
  createdAt: "",
  updatedAt: "",
  intention: "New/Update",
  dataType: "Metadata and Data Files",
  archived: false,
  validationStarted: "",
  validationEnded: "",
  validationScope: "New",
  validationType: ["metadata", "file"],
  studyID: "",
  deletingData: false,
  nodeCount: 0,
  collaborators: [],
  metadataValidationStatus: "New",
  fileValidationStatus: "New",
};

const baseContext: AuthCtxState = {
  status: AuthStatus.LOADED,
  isLoggedIn: false,
  user: null,
};

const baseUser: Omit<User, "role" | "permissions"> = {
  _id: "current-user",
  firstName: "",
  lastName: "",
  userStatus: "Active",
  IDP: "nih",
  email: "",
  studies: null,
  dataCommons: [baseSubmission.dataCommons],
  createdAt: "",
  updateAt: "",
  notifications: [],
};

export const Default: Story = {
  args: {
    userRole: "Data Commons Personnel",
    permissions: ["data_submission:review"],
    status: "In Progress",
  },
};

export default meta;
