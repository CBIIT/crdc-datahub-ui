import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  Context as AuthContext,
  ContextState as AuthCtxState,
} from "../../components/Contexts/AuthContext";
import DataSubmissionActions from "./DataSubmissionActions";
import { Roles } from "../../config/AuthRoles";
import {
  SubmissionContext,
  SubmissionCtxState,
  SubmissionCtxStatus,
} from "../../components/Contexts/SubmissionContext";

const meta: Meta<typeof DataSubmissionActions> = {
  title: "Data Submissions / Actions",
  component: DataSubmissionActions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DataSubmissionActions>;

export default meta;

type Story = StoryObj<typeof meta>;

const baseSubmission: Submission = {
  _id: "submission-1",
  name: "",
  submitterID: "example-user",
  submitterName: "",
  organization: undefined,
  dataCommons: "",
  dataCommonsDisplayName: "",
  modelVersion: "",
  studyID: "",
  studyAbbreviation: "",
  dbGaPID: "",
  bucketName: "",
  rootPath: "",
  status: "In Progress",
  metadataValidationStatus: "New",
  fileValidationStatus: "New",
  crossSubmissionStatus: "New",
  deletingData: false,
  archived: false,
  validationStarted: "",
  validationEnded: "",
  validationScope: "New",
  validationType: [],
  fileErrors: [],
  history: [],
  conciergeName: "",
  conciergeEmail: "",
  intention: "New/Update",
  dataType: "Metadata Only",
  otherSubmissions: "",
  nodeCount: 0,
  collaborators: [],
  dataFileSize: {
    formatted: "",
    size: 0,
  },
  createdAt: "",
  updatedAt: "",
};

const baseSubmissionCtx: SubmissionCtxState = {
  status: SubmissionCtxStatus.LOADING,
  data: { getSubmission: baseSubmission, batchStatusList: null, submissionStats: null },
  error: null,
  startPolling: fn(),
  stopPolling: fn(),
  refetch: fn(),
  updateQuery: fn(),
};

const dataSubmissionPermissions: DataSubmissionPermissions[] = [
  "data_submission:view",
  "data_submission:create",
  "data_submission:review",
  "data_submission:admin_submit",
  "data_submission:confirm",
  "data_submission:cancel",
];

const submissionStatuses: SubmissionStatus[] = [
  "New",
  "In Progress",
  "Canceled",
  "Submitted",
  "Withdrawn",
  "Rejected",
  "Released",
  "Completed",
  "Deleted",
];

const validationStatuses: (ValidationStatus | null)[] = [
  null,
  "Validating",
  "New",
  "Error",
  "Passed",
  "Warning",
];

export const Default: Story = {
  args: {
    role: "Submitter",
    permissions: [
      "data_submission:view",
      "data_submission:create",
      "data_submission:review",
      "data_submission:admin_submit",
      "data_submission:confirm",
      "data_submission:cancel",
    ],
    submissionStatus: "In Progress",
    metadataValidationStatus: "Passed",
    fileValidationStatus: "Passed",
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
      options: dataSubmissionPermissions,
      control: {
        type: "check",
      },
    },
    submissionStatus: {
      name: "Status",
      options: submissionStatuses,
      control: {
        type: "radio",
      },
    },
    metadataValidationStatus: {
      name: "metadataValidationStatus",
      options: validationStatuses,
      control: {
        type: "radio",
      },
    },
    fileValidationStatus: {
      name: "fileValidationStatus",
      options: validationStatuses,
      control: {
        type: "radio",
      },
    },
  },
  decorators: [
    (Story, context) => (
      <AuthContext.Provider
        value={
          {
            isLoggedIn: true,
            user: {
              _id: "example-user",
              firstName: "Example",
              role: context.args.role,
              permissions: context.args.permissions,
            } as User,
          } as AuthCtxState
        }
      >
        <SubmissionContext.Provider
          value={{
            ...baseSubmissionCtx,
            data: {
              ...baseSubmissionCtx.data,
              getSubmission: {
                ...baseSubmissionCtx.data.getSubmission,
                status: context.args.submissionStatus,
                dataType: "Metadata and Data Files",
                metadataValidationStatus: context.args.metadataValidationStatus,
                fileValidationStatus: context.args.fileValidationStatus,
              },
            },
            qcData: {
              submissionQCResults: null,
            },
          }}
        >
          <Story />
        </SubmissionContext.Provider>
      </AuthContext.Provider>
    ),
  ],
};

export const ValidationShouldNotCurrentlyBeRunning: Story = {
  name: "Validation should not currently be running",
  args: {
    role: "Submitter" as UserRole,
    permissions: [
      "data_submission:view",
      "data_submission:create",
      "data_submission:cancel",
    ] as AuthPermissions[],
    submissionStatus: "In Progress" as SubmissionStatus,
    metadataValidationStatus: "Validating" as ValidationStatus,
    fileValidationStatus: "Validating" as ValidationStatus,
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
      options: dataSubmissionPermissions,
      control: {
        type: "check",
      },
    },
    submissionStatus: {
      name: "Status",
      options: submissionStatuses,
      control: {
        type: "radio",
      },
    },
    metadataValidationStatus: {
      name: "metadataValidationStatus",
      options: validationStatuses,
      control: {
        type: "radio",
      },
    },
    fileValidationStatus: {
      name: "fileValidationStatus",
      options: validationStatuses,
      control: {
        type: "radio",
      },
    },
  },
  decorators: [
    (Story, context) => (
      <AuthContext.Provider
        value={
          {
            isLoggedIn: true,
            user: {
              _id: "example-user",
              firstName: "Example",
              role: context.args.role,
              permissions: context.args.permissions,
            } as User,
          } as AuthCtxState
        }
      >
        <SubmissionContext.Provider
          value={{
            ...baseSubmissionCtx,
            data: {
              ...baseSubmissionCtx.data,
              getSubmission: {
                ...baseSubmissionCtx.data.getSubmission,
                status: context.args.submissionStatus,
                dataType: "Metadata and Data Files",
                metadataValidationStatus: context.args.metadataValidationStatus,
                fileValidationStatus: context.args.fileValidationStatus,
              },
            },
            qcData: {
              submissionQCResults: null,
            },
          }}
        >
          <Story />
        </SubmissionContext.Provider>
      </AuthContext.Provider>
    ),
  ],
};
