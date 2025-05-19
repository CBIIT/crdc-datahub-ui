import { ComponentPropsWithoutRef } from "react";
import type { Decorator, Meta, StoryObj } from "@storybook/react";
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
import { ORPHANED_FILE_ERROR_TITLE } from "../../config/SubmitButtonConfig";

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

type ContextArgs = {
  role: UserRole;
  permissions: DataSubmissionPermissions[];
  submissionStatus: SubmissionStatus;
  metadataValidationStatus: ValidationStatus | null;
  fileValidationStatus: ValidationStatus | null;
  dataType: SubmissionDataType;
  intention: SubmissionIntention;
  submissionQCResults: ValidationResult<Pick<QCResult, "errors">> | null;
  batchStatusList: { batches: Pick<Batch, "_id" | "status">[] } | null;
};

type ComponentProps = ComponentPropsWithoutRef<typeof DataSubmissionActions>;

type StoryArgs = ContextArgs & ComponentProps;

const withProviders: Decorator<StoryArgs> = (Story, context) => {
  const {
    role,
    permissions,
    submissionStatus,
    metadataValidationStatus,
    fileValidationStatus,
    dataType,
    intention,
    submissionQCResults,
    batchStatusList,
  } = context.args;

  return (
    <AuthContext.Provider
      value={
        {
          isLoggedIn: true,
          user: {
            _id: "example-user",
            firstName: "Example",
            role,
            permissions,
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
              status: submissionStatus,
              metadataValidationStatus,
              fileValidationStatus,
              dataType,
              intention,
            },
            batchStatusList,
          },
          qcData: {
            submissionQCResults,
          },
        }}
      >
        <Story />
      </SubmissionContext.Provider>
    </AuthContext.Provider>
  );
};

const meta = {
  title: "Data Submissions / Actions",
  component: DataSubmissionActions,
  parameters: {
    layout: "centered",
  },
  decorators: [withProviders],
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
    dataType: {
      name: "dataType",
      options: ["Metadata and Data Files", "Metadata Only"],
      control: {
        type: "radio",
      },
    },
    intention: {
      name: "intention",
      options: ["New/Update", "Delete"],
      control: {
        type: "radio",
      },
    },
    submissionQCResults: {
      name: "submissionQCResults",
      control: {
        type: "text",
      },
    },
    batchStatusList: {
      name: "batchStatusList",
      control: {
        type: "text",
      },
    },
  },
  args: {
    role: "Submitter",
    permissions: ["data_submission:view", "data_submission:create", "data_submission:cancel"],
    submissionStatus: "In Progress",
    metadataValidationStatus: "Passed",
    fileValidationStatus: "Passed",
    dataType: "Metadata and Data Files",
    intention: "New/Update",
    submissionQCResults: null,
    batchStatusList: null,
    onAction: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<StoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UserIsMissingSubmitPermissions: Story = {
  name: "User is missing 'data_submission:create' and 'data_submission:admin_submit' permissions",
  args: {
    role: "Admin",
    permissions: ["data_submission:view", "data_submission:review", "data_submission:cancel"],
  },
};

export const MetadataValidationShouldBeInitializedForDeleteIntention: Story = {
  name: "Metadata validation should be initialized for 'Delete' intention",
  args: { intention: "Delete", metadataValidationStatus: null },
};

export const MetadataValidationShouldBeInitializedForMetadataOnlySubmissions: Story = {
  name: "Metadata validation should be initialized for 'Metadata Only' submissions",
  args: { dataType: "Metadata Only", metadataValidationStatus: null },
};

export const DataFileValidationShouldBeInitializedForMetadataAndDataFileSubmissions: Story = {
  name: "Data file validation should be initialized for 'Metadata and Data Files' submissions",
  args: { dataType: "Metadata and Data Files", fileValidationStatus: null },
};

export const MetadataValidationShouldBeInitializedForMetadataAndDataFilesSubmissions: Story = {
  name: "Metadata validation should be initialized for 'Metadata and Data Files' submissions",
  args: { dataType: "Metadata and Data Files", metadataValidationStatus: null },
};

export const MetadataAndDataFileShouldNotHaveNewStatus: Story = {
  name: "Metadata and Data File should not have 'New' status",
  args: { metadataValidationStatus: "New", fileValidationStatus: "New" },
};

export const SubmissionShouldNotHaveOrphanedFiles: Story = {
  name: "Submission should not have orphaned files",
  args: {
    submissionQCResults: {
      total: 1,
      results: [
        { errors: [{ title: ORPHANED_FILE_ERROR_TITLE, code: "M018" as const, description: "" }] },
      ],
    },
  },
};

export const ValidationShouldNotCurrentlyBeRunning: Story = {
  name: "Validation should not currently be running",
  args: { metadataValidationStatus: "Validating", fileValidationStatus: "Validating" },
};

export const BatchesShouldNotBeUploading: Story = {
  name: "No Batches should have 'Uploading' status",
  args: { batchStatusList: { batches: [{ _id: "batch-1", status: "Uploading" as BatchStatus }] } },
};

export const ThereShouldBeNoValidationErrorsForMetadataOrDataFiles: Story = {
  name: "There should be no validation errors for metadata or data files",
  args: { metadataValidationStatus: "Error", fileValidationStatus: "Error" },
};

export const AdminOverrideSubmissionHasValidationErrors: Story = {
  name: "Admin Override - Submission has validation errors",
  args: {
    metadataValidationStatus: "Error",
    fileValidationStatus: "Error",
    role: "Admin",
    permissions: [
      "data_submission:view",
      "data_submission:create",
      "data_submission:cancel",
      "data_submission:admin_submit",
    ],
  },
};

export const AdminCanPerformRegularSubmitWithAdminSubmitPermissions: Story = {
  name: "Admin can perform regular submit with 'admin_submit' permissions",
  args: {
    role: "Admin",
    permissions: ["data_submission:view", "data_submission:cancel", "data_submission:admin_submit"],
  },
};
