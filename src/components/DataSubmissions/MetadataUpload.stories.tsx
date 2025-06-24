import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { Roles } from "../../config/AuthRoles";
import { GetSubmissionResp } from "../../graphql";
import {
  Context as AuthContext,
  ContextState as AuthCtxState,
  Status as AuthStatus,
} from "../Contexts/AuthContext";
import { SubmissionContext, SubmissionCtxStatus } from "../Contexts/SubmissionContext";

import MetadataUpload from "./MetadataUpload";

type CustomStoryProps = React.ComponentProps<typeof MetadataUpload> & {
  submission: Submission;
  userRole: UserRole;
  permissions: AuthPermissions[];
};

const meta: Meta<CustomStoryProps> = {
  title: "Data Submissions / Metadata Upload",
  component: MetadataUpload,
  tags: ["autodocs"],
  argTypes: {
    submission: { control: false },
    userRole: {
      description: "Role of the user",
      control: "select",
      options: Roles,
    },
    permissions: {
      description: "Permissions assigned to the user",
      control: "check",
      options: ["data_submission:view", "data_submission:create", "data_submission:review"],
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
            getSubmission: context.args.submission,
          } as GetSubmissionResp,
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
            versions: ["6.1.2", "5.1.2", "5.0.4", "3.0.0", "1.9.2"],
          },
        })
      );

      return <Story />;
    },
  ],
} satisfies Meta<CustomStoryProps>;

type Story = StoryObj<CustomStoryProps>;

const baseSubmission: Submission = {
  _id: "",
  name: "",
  submitterID: "current-user",
  submitterName: "",
  organization: null,
  dataCommons: "",
  dataCommonsDisplayName: "",
  modelVersion: "",
  studyAbbreviation: "",
  studyName: "",
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
  status: "New",
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
  dataFileSize: null,
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
  institution: null,
  dataCommons: ["MOCK-DC"],
  dataCommonsDisplayNames: ["MOCK-DC"],
  createdAt: "",
  updateAt: "",
  notifications: [],
};

export const Default: Story = {
  args: {
    onUpload: fn(),
    onCreateBatch: fn(),
    submission: baseSubmission,
    readOnly: false,
    userRole: "Submitter",
    permissions: ["data_submission:view", "data_submission:create"],
  },
};

/**
 * Story for the MetadataUpload component with the Data Model Version adornment visible
 */
export const ModelVersionAdornment: Story = {
  name: "w/Model Version",
  args: {
    ...Default.args,
    submission: {
      ...baseSubmission,
      modelVersion: "5.1.2",
      dataCommons: "MOCK-DC",
      dataCommonsDisplayName: "A Mock DC",
    },
    userRole: "Submitter",
    permissions: ["data_submission:view", "data_submission:create"],
  },
};

/**
 * Story for the MetadataUpload component with the Data Model Version adornment visible
 * and the user having permissions to change the model version
 */
export const ModelVersionChangeAdornment: Story = {
  name: "w/Model Version Change",
  args: {
    ...Default.args,
    submission: {
      ...baseSubmission,
      modelVersion: "5.1.2",
      dataCommons: "MOCK-DC",
      dataCommonsDisplayName: "A Mock DC",
    },
    userRole: "Data Commons Personnel",
    permissions: ["data_submission:view", "data_submission:create", "data_submission:review"],
  },
};

export default meta;
