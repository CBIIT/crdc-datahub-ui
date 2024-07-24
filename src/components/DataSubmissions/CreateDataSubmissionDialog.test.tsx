import { FC } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import CreateDataSubmissionDialog from "./CreateDataSubmissionDialog";
import {
  Context as AuthCtx,
  ContextState as AuthCtxState,
  Status as AuthStatus,
} from "../Contexts/AuthContext";
import {
  CREATE_SUBMISSION,
  CreateSubmissionResp,
  LIST_APPROVED_STUDIES_OF_MY_ORG,
  LIST_ORGS,
  ListApprovedStudiesOfMyOrgResp,
  ListOrgsResp,
} from "../../graphql";
import { OrganizationProvider } from "../Contexts/OrganizationListContext";

const listApprovedStudiesOfMyOrgMocks: MockedResponse<ListApprovedStudiesOfMyOrgResp>[] = [
  {
    request: {
      query: LIST_APPROVED_STUDIES_OF_MY_ORG,
    },
    result: {
      data: {
        listApprovedStudiesOfMyOrganization: [
          {
            _id: "study1",
            studyName: "study-name",
            studyAbbreviation: "SN",
            dbGaPID: "phsTEST",
            controlledAccess: null,
          },
          {
            _id: "study2",
            studyName: "controlled-study",
            studyAbbreviation: "CS",
            dbGaPID: "phsTEST",
            controlledAccess: true,
          },
        ],
      },
    },
  },
];

const createSubmissionMocks: MockedResponse<CreateSubmissionResp>[] = [
  {
    request: {
      query: CREATE_SUBMISSION,
      variables: {
        studyID: "study1",
        dataCommons: "CDS",
        name: "Test Submission",
        dbGaPID: "phsTEST001",
        intention: "New/Update",
        dataType: "Metadata and Data Files",
      },
    },
    result: {
      data: {
        createSubmission: {
          _id: "submission-123",
          status: "New",
          createdAt: new Date().toString(),
        },
      },
    },
  },
];

const listOrgsMocks: MockedResponse<ListOrgsResp>[] = [
  {
    request: {
      query: LIST_ORGS,
    },
    result: {
      data: {
        listOrganizations: [
          {
            _id: "some-org-1",
            name: "org1",
            status: "Active",
            conciergeName: "",
            studies: [
              {
                studyName: "study1",
                studyAbbreviation: "SN",
              },
            ],
            createdAt: "2023-10-06T19:19:04.183Z",
            updateAt: "2024-07-03T19:09:29.513Z",
          },
        ],
      },
    },
  },
];

const baseMocks = [...listApprovedStudiesOfMyOrgMocks, ...createSubmissionMocks, ...listOrgsMocks];

const baseUser: Omit<User, "role"> = {
  _id: "",
  firstName: "",
  lastName: "",
  userStatus: "Active",
  IDP: "nih",
  email: "",
  organization: {
    orgID: "some-org-1",
    orgName: "org1",
    createdAt: "2023-10-06T19:19:04.183Z",
    updateAt: "2024-07-03T19:09:29.513Z",
  },
  dataCommons: [],
  createdAt: "",
  updateAt: "",
};

const baseAuthCtx: AuthCtxState = {
  status: AuthStatus.LOADED,
  isLoggedIn: false,
  user: null,
};

type ParentProps = {
  mocks?: MockedResponse[];
  authCtxState?: AuthCtxState;
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({
  authCtxState = baseAuthCtx,
  mocks = baseMocks,
  children,
}) => (
  <AuthCtx.Provider value={authCtxState}>
    <MockedProvider mocks={mocks} addTypename={false}>
      <OrganizationProvider preload>
        <MemoryRouter>{children}</MemoryRouter>
      </OrganizationProvider>
    </MockedProvider>
  </AuthCtx.Provider>
);

describe("CreateDataSubmissionDialog", () => {
  const handleCreate = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog and form inputs correctly", async () => {
    const { getByText, getByRole } = render(
      <TestParent authCtxState={{ ...baseAuthCtx, user: { ...baseUser, role: "Submitter" } }}>
        <CreateDataSubmissionDialog onCreate={handleCreate} />
      </TestParent>
    );
    const openDialogButton = getByRole("button", { name: "Create a Data Submission" });
    expect(openDialogButton).toBeInTheDocument();

    await waitFor(() => expect(openDialogButton).toBeEnabled());

    userEvent.click(openDialogButton);

    await waitFor(() => {
      const createButton = getByRole("button", { name: "Create" });
      expect(createButton).toBeInTheDocument();
      expect(handleCreate).toHaveBeenCalledTimes(0);
      expect(
        getByText("Please fill out the form below to start your data submission")
      ).toBeInTheDocument();
      expect(getByText("Submission Type")).toBeInTheDocument();
      expect(getByText("Data Type")).toBeInTheDocument();
      expect(getByText("Organization")).toBeInTheDocument();
      expect(getByText("Data Commons")).toBeInTheDocument();
      expect(getByText("Study")).toBeInTheDocument();
      expect(getByText("dbGaP ID")).toBeInTheDocument();
      expect(getByText("Submission Name")).toBeInTheDocument();
    });
  });

  it("submits the form successfully", async () => {
    const { getByTestId, getByRole, getByText } = render(
      <TestParent authCtxState={{ ...baseAuthCtx, user: { ...baseUser, role: "Submitter" } }}>
        <CreateDataSubmissionDialog onCreate={handleCreate} />
      </TestParent>
    );
    // Simulate opening dialog
    const openDialogButton = getByRole("button", { name: "Create a Data Submission" });
    expect(openDialogButton).toBeInTheDocument();

    await waitFor(() => expect(openDialogButton).toBeEnabled());

    userEvent.click(openDialogButton);

    await waitFor(() => {
      expect(getByTestId("create-submission-dialog")).toBeInTheDocument();
      const studySelectInput = getByTestId("create-data-submission-dialog-study-id-input");
      expect(studySelectInput).toBeInTheDocument();
    });

    // Simulate selecting study from dropdown
    const studySelectButton = within(
      getByTestId("create-data-submission-dialog-study-id-input")
    ).getByRole("button");
    expect(studySelectButton).toBeInTheDocument();

    userEvent.click(studySelectButton);

    await waitFor(() => {
      expect(studySelectButton).toHaveAttribute("aria-expanded", "true");
    });
    userEvent.click(getByText("SN"));

    expect(studySelectButton).toHaveTextContent("SN");

    // Simulate typing into dbGaPID input
    const dbGaPIDWrapper = getByTestId("create-data-submission-dialog-dbgap-id-input");
    const dbGaPIDInput = within(dbGaPIDWrapper).getByRole("textbox");
    userEvent.type(dbGaPIDInput, "001");

    await waitFor(() => {
      expect(dbGaPIDInput).toHaveValue("phsTEST001");
    });

    // Simulate typing into Submission Name input
    const submissionNameWrapper = getByTestId(
      "create-data-submission-dialog-submission-name-input"
    );
    const submissionNameInput = within(submissionNameWrapper).getByRole("textbox");
    userEvent.type(submissionNameInput, "Test Submission");

    await waitFor(() => {
      expect(submissionNameInput).toHaveValue("Test Submission");
    });

    // Simulate creating the new data submission and closing the dialog
    const createButton = getByRole("button", { name: "Create" });
    expect(createButton).toBeInTheDocument();
    userEvent.click(createButton);

    await waitFor(() => {
      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(createButton).not.toBeInTheDocument();
    });
  });
});
