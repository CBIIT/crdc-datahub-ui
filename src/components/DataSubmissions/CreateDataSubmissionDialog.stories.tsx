import { MockedResponse } from "@apollo/client/testing";
import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within, screen } from "@storybook/test";

import {
  GetMyUserResp,
  CreateSubmissionResp,
  CREATE_SUBMISSION,
  CreateSubmissionInput,
} from "../../graphql";
import { Context as AuthContext, Status as AuthStatus } from "../Contexts/AuthContext";

import CreateDataSubmissionDialog from "./CreateDataSubmissionDialog";

const baseStudies: GetMyUserResp["getMyUser"]["studies"] = [
  {
    _id: "study1",
    studyName: "study-name",
    studyAbbreviation: "SN",
    dbGaPID: "phsTEST",
    controlledAccess: null,
  },
  {
    _id: "study2",
    studyName: "controlled-study with dbGaP ID",
    studyAbbreviation: "CS",
    dbGaPID: "phsTEST",
    controlledAccess: true,
  },
  {
    _id: "no-dbGaP-ID",
    studyName: "controlled-study without dbGaP ID",
    studyAbbreviation: "DB",
    dbGaPID: null,
    controlledAccess: true,
  },
];

const createSubmissionMock: MockedResponse<CreateSubmissionResp, CreateSubmissionInput> = {
  request: {
    query: CREATE_SUBMISSION,
  },
  variableMatcher: () => true,
  result: {
    data: {
      createSubmission: {
        _id: "mock-submission-id",
        status: "New",
        createdAt: new Date().toString(),
      },
    },
  },
};

const baseUser: User = {
  _id: "",
  role: "Submitter",
  firstName: "",
  lastName: "",
  userStatus: "Active",
  IDP: "nih",
  email: "",
  studies: baseStudies,
  institution: null,
  dataCommons: [],
  dataCommonsDisplayNames: [],
  createdAt: "",
  updateAt: "",
  permissions: ["data_submission:create"],
  notifications: [],
};

const meta: Meta<typeof CreateDataSubmissionDialog> = {
  title: "Data Submissions / Create Dialog",
  component: CreateDataSubmissionDialog,
  tags: ["autodocs"],
  parameters: {
    apolloClient: {
      mocks: [createSubmissionMock],
    },
  },
  decorators: [
    (Story) => (
      <Box mt={3}>
        <Story />
      </Box>
    ),
    (Story) => (
      <AuthContext.Provider
        value={{
          status: AuthStatus.LOADED,
          isLoggedIn: true,
          user: {
            ...baseUser,
          },
        }}
      >
        <Story />
      </AuthContext.Provider>
    ),
  ],
} satisfies Meta<typeof CreateDataSubmissionDialog>;

export default meta;
type Story = StoryObj<typeof CreateDataSubmissionDialog>;

export const Button: Story = {
  args: {
    onCreate: fn(),
  },
};

export const Dialog: Story = {
  ...Button,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Create a Data Submission" }));

    await screen.findAllByRole("presentation");
  },
};
