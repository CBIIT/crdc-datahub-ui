import React, { FC } from "react";
import { act, render, waitFor, within } from "@testing-library/react";
import { MemoryRouter, MemoryRouterProps } from "react-router-dom";
import { ApolloError } from "@apollo/client";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { SearchParamsProvider } from "../../components/Contexts/SearchParamsContext";
import {
  GET_APPROVED_STUDY,
  UPDATE_APPROVED_STUDY,
  CREATE_APPROVED_STUDY,
  GetApprovedStudyResp,
  GetApprovedStudyInput,
  LIST_ACTIVE_DCPS,
  ListActiveDCPsResp,
  CreateApprovedStudyResp,
  CreateApprovedStudyInput,
  UpdateApprovedStudyResp,
  UpdateApprovedStudyInput,
} from "../../graphql";
import StudyView from "./StudyView";

const mockUsePageTitle = vi.fn();
vi.mock("../../hooks/usePageTitle", async () => ({
  ...(await vi.importActual("../../hooks/usePageTitle")),
  default: (...p) => mockUsePageTitle(...p),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

const listActiveDCPsMock: MockedResponse<ListActiveDCPsResp> = {
  request: {
    query: LIST_ACTIVE_DCPS,
  },
  variableMatcher: () => true,
  result: {
    data: {
      listActiveDCPs: [
        {
          userID: "dcp-1",
          firstName: "John",
          lastName: "Doe",
          createdAt: "",
          updateAt: "",
        },
        {
          userID: "dcp-2",
          firstName: "James",
          lastName: "Smith",
          createdAt: "",
          updateAt: "",
        },
      ],
    },
  },
};

type ParentProps = {
  mocks?: MockedResponse[];
  initialEntries?: MemoryRouterProps["initialEntries"];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({
  mocks = [listActiveDCPsMock],
  initialEntries = ["/"],
  children,
}: ParentProps) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter initialEntries={initialEntries}>
      <SearchParamsProvider>{children}</SearchParamsProvider>
    </MemoryRouter>
  </MockedProvider>
);

describe("StudyView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("renders without crashing", () => {
    const { getByTestId } = render(
      <TestParent>
        <StudyView _id="new" />
      </TestParent>
    );
    expect(getByTestId("studyName-input")).toBeInTheDocument();
    expect(getByTestId("studyAbbreviation-input")).toBeInTheDocument();
    expect(getByTestId("PI-input")).toBeInTheDocument();
    expect(getByTestId("dbGaPID-input")).toBeInTheDocument();
    expect(getByTestId("ORCID-input")).toBeInTheDocument();
    expect(getByTestId("openAccess-checkbox")).toBeInTheDocument();
    expect(getByTestId("controlledAccess-checkbox")).toBeInTheDocument();
    expect(getByTestId("save-button")).toBeInTheDocument();
    expect(getByTestId("cancel-button")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <TestParent>
        <StudyView _id="new" />
      </TestParent>
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  it("should set the page title 'Add Study'", async () => {
    render(
      <TestParent>
        <StudyView _id="new" />
      </TestParent>
    );

    await waitFor(() => {
      expect(mockUsePageTitle).toHaveBeenCalledWith("Add Study");
    });
  });

  it("should set the page title as 'Edit Study' with the ID displaying", async () => {
    const getApprovedStudyMock = {
      request: {
        query: GET_APPROVED_STUDY,
        variables: { _id: "test-id" },
      },
      result: {
        data: {
          getApprovedStudy: {
            _id: "test-id",
            studyName: "Test Study",
            studyAbbreviation: "TS",
            PI: "John Doe",
            dbGaPID: "db123456",
            ORCID: "0000-0001-2345-6789",
            openAccess: true,
            controlledAccess: false,
          },
        },
      },
    };

    render(
      <TestParent mocks={[listActiveDCPsMock, getApprovedStudyMock]}>
        <StudyView _id="test-id" />
      </TestParent>
    );

    await waitFor(() => {
      expect(mockUsePageTitle).toHaveBeenCalledWith("Edit Study test-id");
    });
  });

  it("should show a loading spinner while retrieving approved study is loading", async () => {
    const getApprovedStudyMock = {
      request: {
        query: GET_APPROVED_STUDY,
        variables: { _id: "test-id" },
      },
      result: {
        data: {
          getApprovedStudy: {
            _id: "test-id",
            studyName: "Test Study",
            studyAbbreviation: "TS",
            PI: "John Doe",
            dbGaPID: "db123456",
            ORCID: "0000-0001-2345-6789",
            openAccess: true,
            controlledAccess: false,
          },
        },
      },
      delay: 1000,
    };

    const { getByTestId } = render(
      <TestParent mocks={[listActiveDCPsMock, getApprovedStudyMock]}>
        <StudyView _id="test-id" />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("study-view-suspense-loader")).toBeInTheDocument();
    });
  });

  it("renders all input fields correctly", () => {
    const { getByTestId } = render(
      <TestParent>
        <StudyView _id="new" />
      </TestParent>
    );
    expect(getByTestId("studyName-input")).toBeInTheDocument();
    expect(getByTestId("studyAbbreviation-input")).toBeInTheDocument();
    expect(getByTestId("PI-input")).toBeInTheDocument();
    expect(getByTestId("dbGaPID-input")).toBeInTheDocument();
    expect(getByTestId("ORCID-input")).toBeInTheDocument();
    expect(getByTestId("openAccess-checkbox")).toBeInTheDocument();
    expect(getByTestId("controlledAccess-checkbox")).toBeInTheDocument();
  });

  it("allows users to input text into the fields", async () => {
    const { getByTestId } = render(
      <TestParent>
        <StudyView _id="new" />
      </TestParent>
    );
    const studyNameInput = getByTestId("studyName-input") as HTMLInputElement;
    const studyAbbreviationInput = getByTestId("studyAbbreviation-input") as HTMLInputElement;
    const PIInput = getByTestId("PI-input") as HTMLInputElement;
    const dbGaPIDInput = getByTestId("dbGaPID-input") as HTMLInputElement;
    const ORCIDInput = getByTestId("ORCID-input") as HTMLInputElement;

    userEvent.type(studyNameInput, "Test Study Name");
    expect(studyNameInput.value).toBe("Test Study Name");

    userEvent.type(studyAbbreviationInput, "TSN");
    expect(studyAbbreviationInput.value).toBe("TSN");

    userEvent.type(PIInput, "John Doe");
    expect(PIInput.value).toBe("John Doe");

    userEvent.type(dbGaPIDInput, "db123456");
    expect(dbGaPIDInput.value).toBe("db123456");

    userEvent.type(ORCIDInput, "0000-0001-2345-6789");
    expect(ORCIDInput.value).toBe("0000-0001-2345-6789");
  });

  it("validates required fields and shows error if access type is not selected", async () => {
    const { getByTestId, getByText } = render(
      <TestParent>
        <StudyView _id="new" />
      </TestParent>
    );

    const studyNameInput = getByTestId("studyName-input") as HTMLInputElement;
    const PIInput = getByTestId("PI-input") as HTMLInputElement;
    const ORCIDInput = getByTestId("ORCID-input") as HTMLInputElement;
    const saveButton = getByTestId("save-button");

    userEvent.type(studyNameInput, "Test Study Name");
    userEvent.type(PIInput, "John Doe");
    userEvent.type(ORCIDInput, "0000-0001-2345-6789");

    userEvent.click(saveButton);

    await waitFor(() => {
      expect(
        getByText("Invalid Access Type. Please select at least one Access Type.")
      ).toBeInTheDocument();
    });
  });

  it("validates ORCID format", async () => {
    const { getByTestId } = render(
      <TestParent>
        <StudyView _id="new" />
      </TestParent>
    );

    const studyNameInput = getByTestId("studyName-input") as HTMLInputElement;
    const PIInput = getByTestId("PI-input") as HTMLInputElement;
    const ORCIDInput = getByTestId("ORCID-input") as HTMLInputElement;
    const openAccessCheckbox = getByTestId("openAccess-checkbox");
    const saveButton = getByTestId("save-button");

    userEvent.type(studyNameInput, "Test Study Name");
    userEvent.type(PIInput, "John Doe");
    userEvent.type(ORCIDInput, "0");
    userEvent.click(openAccessCheckbox);

    userEvent.click(saveButton);

    await waitFor(() => {
      expect(getByTestId("alert-error-message")).toHaveTextContent("Invalid ORCID format.");
    });
  });

  it("creates a new study successfully", async () => {
    const createApprovedStudyMock: MockedResponse<
      CreateApprovedStudyResp,
      CreateApprovedStudyInput
    > = {
      request: {
        query: CREATE_APPROVED_STUDY,
        variables: {
          PI: "John Doe",
          dbGaPID: "db123456",
          ORCID: "0000-0001-2345-6789",
          openAccess: true,
          controlledAccess: false,
          name: "Test Study Name",
          acronym: "TSN",
          primaryContactID: "dcp-1",
          useProgramPC: false,
        },
      },
      result: {
        data: {
          createApprovedStudy: {
            _id: "new-study-id",
          },
        },
      },
    };

    const { getByTestId } = render(
      <TestParent mocks={[listActiveDCPsMock, createApprovedStudyMock]}>
        <StudyView _id="new" />
      </TestParent>
    );

    const studyNameInput = getByTestId("studyName-input") as HTMLInputElement;
    const studyAbbreviationInput = getByTestId("studyAbbreviation-input") as HTMLInputElement;
    const PIInput = getByTestId("PI-input") as HTMLInputElement;
    const dbGaPIDInput = getByTestId("dbGaPID-input") as HTMLInputElement;
    const ORCIDInput = getByTestId("ORCID-input") as HTMLInputElement;
    const openAccessCheckbox = getByTestId("openAccess-checkbox");
    const sameAsProgramPrimaryContactCheckbox = getByTestId("sameAsProgramPrimaryContact-checkbox");
    const primaryContactIDSelect = within(getByTestId("primaryContactID-select")).getByRole(
      "button"
    );
    const saveButton = getByTestId("save-button");

    userEvent.type(studyNameInput, "Test Study Name");
    userEvent.type(studyAbbreviationInput, "TSN");
    userEvent.type(PIInput, "John Doe");
    userEvent.type(dbGaPIDInput, "db123456");
    userEvent.type(ORCIDInput, "0000-0001-2345-6789");
    userEvent.click(openAccessCheckbox);
    userEvent.click(sameAsProgramPrimaryContactCheckbox);
    userEvent.click(primaryContactIDSelect);

    await waitFor(() => {
      const muiSelectOptions = within(getByTestId("primaryContactID-select")).getAllByRole(
        "option",
        {
          hidden: true,
        }
      );
      expect(muiSelectOptions[0]).toHaveTextContent("<Not Set>");
      expect(muiSelectOptions[1]).toHaveTextContent("John Doe");
      expect(muiSelectOptions[2]).toHaveTextContent("James Smith");
    });

    userEvent.selectOptions(
      within(getByTestId("primaryContactID-select")).getByRole("listbox", {
        hidden: true,
      }),
      "John Doe"
    );

    expect(getByTestId("primaryContactID-select")).toHaveTextContent("John Doe");

    userEvent.click(saveButton);

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("This study has been successfully added.", {
        variant: "default",
      });
    });
  });

  it("updates an existing study successfully", async () => {
    const studyId = "existing-study-id";
    const getApprovedStudyMock: MockedResponse<GetApprovedStudyResp, GetApprovedStudyInput> = {
      request: {
        query: GET_APPROVED_STUDY,
        variables: { _id: studyId },
      },
      result: {
        data: {
          getApprovedStudy: {
            _id: studyId,
            studyName: "Existing Study",
            studyAbbreviation: "ES",
            PI: "Jane Smith",
            dbGaPID: "db654321",
            ORCID: "0000-0002-3456-7890",
            openAccess: false,
            controlledAccess: true,
            programs: [
              {
                _id: "program-1",
                conciergeID: "primary-contact-1",
                conciergeName: "John Doe",
                name: "",
              },
            ],
            primaryContact: null,
            useProgramPC: true,
            createdAt: "",
          },
        },
      },
    };

    const updateApprovedStudyMock: MockedResponse<
      UpdateApprovedStudyResp,
      UpdateApprovedStudyInput
    > = {
      request: {
        query: UPDATE_APPROVED_STUDY,
        variables: {
          studyID: studyId,
          PI: "Jane Smith",
          dbGaPID: "db654321",
          ORCID: "0000-0002-3456-7890",
          openAccess: false,
          controlledAccess: true,
          name: "Updated Study Name",
          acronym: "ES",
          primaryContactID: undefined,
          useProgramPC: true,
        },
      },
      result: {
        data: {
          updateApprovedStudy: {
            _id: studyId,
          },
        },
      },
    };

    const { getByTestId } = render(
      <TestParent mocks={[listActiveDCPsMock, getApprovedStudyMock, updateApprovedStudyMock]}>
        <StudyView _id={studyId} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("studyName-input")).toHaveValue("Existing Study");
    });

    const studyNameInput = getByTestId("studyName-input") as HTMLInputElement;
    const saveButton = getByTestId("save-button");

    userEvent.clear(studyNameInput);
    userEvent.type(studyNameInput, "Updated Study Name");

    userEvent.click(saveButton);

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("All changes have been saved.", {
        variant: "default",
      });
    });
  });

  it("handles API errors gracefully when creating a new study", async () => {
    const createApprovedStudyMock: MockedResponse<
      CreateApprovedStudyResp,
      CreateApprovedStudyInput
    > = {
      request: {
        query: CREATE_APPROVED_STUDY,
        variables: {
          PI: "John Doe",
          dbGaPID: "",
          ORCID: "0000-0001-2345-6789",
          openAccess: true,
          controlledAccess: false,
          name: "Test Study Name",
          acronym: "TSN",
          primaryContactID: "dcp-1",
          useProgramPC: false,
        },
      },
      error: new Error("Unable to create approved study."),
    };

    const { getByTestId, getByText } = render(
      <TestParent mocks={[listActiveDCPsMock, createApprovedStudyMock]}>
        <StudyView _id="new" />
      </TestParent>
    );

    const studyNameInput = getByTestId("studyName-input") as HTMLInputElement;
    const studyAbbreviationInput = getByTestId("studyAbbreviation-input") as HTMLInputElement;
    const PIInput = getByTestId("PI-input") as HTMLInputElement;
    const ORCIDInput = getByTestId("ORCID-input") as HTMLInputElement;
    const openAccessCheckbox = getByTestId("openAccess-checkbox");
    const sameAsProgramPrimaryContactCheckbox = getByTestId("sameAsProgramPrimaryContact-checkbox");
    const primaryContactIDSelect = within(getByTestId("primaryContactID-select")).getByRole(
      "button"
    );
    const saveButton = getByTestId("save-button");

    userEvent.type(studyNameInput, "Test Study Name");
    userEvent.type(studyAbbreviationInput, "TSN");
    userEvent.type(PIInput, "John Doe");
    userEvent.type(ORCIDInput, "0000-0001-2345-6789");
    userEvent.click(openAccessCheckbox);
    userEvent.click(sameAsProgramPrimaryContactCheckbox);
    userEvent.click(primaryContactIDSelect);

    await waitFor(() => {
      const muiSelectOptions = within(getByTestId("primaryContactID-select")).getAllByRole(
        "option",
        {
          hidden: true,
        }
      );
      expect(muiSelectOptions[0]).toHaveTextContent("<Not Set>");
      expect(muiSelectOptions[1]).toHaveTextContent("John Doe");
      expect(muiSelectOptions[2]).toHaveTextContent("James Smith");
    });

    userEvent.selectOptions(
      within(getByTestId("primaryContactID-select")).getByRole("listbox", {
        hidden: true,
      }),
      "John Doe"
    );

    expect(getByTestId("primaryContactID-select")).toHaveTextContent("John Doe");

    userEvent.click(saveButton);

    await waitFor(() => {
      expect(getByText("Unable to create approved study.")).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully when updating an existing study", async () => {
    const studyId = "existing-study-id";
    const getApprovedStudyMock: MockedResponse<GetApprovedStudyResp, GetApprovedStudyInput> = {
      request: {
        query: GET_APPROVED_STUDY,
        variables: { _id: studyId },
      },
      result: {
        data: {
          getApprovedStudy: {
            _id: studyId,
            studyName: "Existing Study",
            studyAbbreviation: "USN",
            PI: "Jane Smith",
            dbGaPID: "db654321",
            ORCID: "0000-0002-3456-7890",
            openAccess: false,
            controlledAccess: true,
            programs: [
              {
                _id: "program-1",
                conciergeID: "primary-contact-1",
                conciergeName: "John Doe",
                name: "",
              },
            ],
            primaryContact: null,
            useProgramPC: true,
            createdAt: "",
          },
        },
      },
    };

    const updateApprovedStudyMock: MockedResponse<
      UpdateApprovedStudyResp,
      UpdateApprovedStudyInput
    > = {
      request: {
        query: UPDATE_APPROVED_STUDY,
        variables: {
          studyID: studyId,
          PI: "Jane Smith",
          dbGaPID: "db654321",
          ORCID: "0000-0002-3456-7890",
          openAccess: false,
          controlledAccess: true,
          name: "Updated Study Name",
          acronym: "USN",
          primaryContactID: undefined,
          useProgramPC: true,
        },
      },
      error: new Error("Unable to save changes"),
    };

    const { getByTestId, findByText } = render(
      <TestParent mocks={[listActiveDCPsMock, getApprovedStudyMock, updateApprovedStudyMock]}>
        <StudyView _id={studyId} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("studyName-input")).toHaveValue("Existing Study");
    });

    const studyNameInput = getByTestId("studyName-input") as HTMLInputElement;
    const studyAbbreviationInput = getByTestId("studyAbbreviation-input") as HTMLInputElement;
    const saveButton = getByTestId("save-button");

    userEvent.clear(studyNameInput);
    userEvent.type(studyNameInput, "Updated Study Name");

    userEvent.clear(studyAbbreviationInput);
    userEvent.type(studyAbbreviationInput, "USN");

    userEvent.click(saveButton);

    expect(await findByText("Unable to save changes")).toBeInTheDocument();
  });

  it("disables checkboxes and sets readOnly prop when saving is true", async () => {
    const createApprovedStudyMock: MockedResponse<
      CreateApprovedStudyResp,
      CreateApprovedStudyInput
    > = {
      request: {
        query: CREATE_APPROVED_STUDY,
        variables: {
          PI: "John Doe",
          dbGaPID: "",
          ORCID: "0000-0001-2345-6789",
          openAccess: true,
          controlledAccess: false,
          name: "Test Study Name",
          acronym: "",
          primaryContactID: "dcp-1",
          useProgramPC: false,
        },
      },
      result: {
        data: {
          createApprovedStudy: {
            _id: "new-study-id",
          },
        },
      },
      delay: 1000,
    };

    const { getByTestId } = render(
      <TestParent mocks={[listActiveDCPsMock, createApprovedStudyMock]}>
        <StudyView _id="new" />
      </TestParent>
    );

    const studyNameInput = getByTestId("studyName-input") as HTMLInputElement;
    const PIInput = getByTestId("PI-input") as HTMLInputElement;
    const ORCIDInput = getByTestId("ORCID-input") as HTMLInputElement;
    const sameAsProgramPrimaryContactCheckbox = getByTestId("sameAsProgramPrimaryContact-checkbox");
    const primaryContactIDSelect = within(getByTestId("primaryContactID-select")).getByRole(
      "button"
    );
    const saveButton = getByTestId("save-button");

    userEvent.type(studyNameInput, "Test Study Name");
    userEvent.type(PIInput, "John Doe");
    userEvent.type(ORCIDInput, "0000-0001-2345-6789");
    userEvent.click(sameAsProgramPrimaryContactCheckbox);
    userEvent.click(primaryContactIDSelect);

    await waitFor(() => {
      const muiSelectOptions = within(getByTestId("primaryContactID-select")).getAllByRole(
        "option",
        {
          hidden: true,
        }
      );
      expect(muiSelectOptions[0]).toHaveTextContent("<Not Set>");
      expect(muiSelectOptions[1]).toHaveTextContent("John Doe");
      expect(muiSelectOptions[2]).toHaveTextContent("James Smith");
    });

    userEvent.selectOptions(
      within(getByTestId("primaryContactID-select")).getByRole("listbox", {
        hidden: true,
      }),
      "John Doe"
    );

    expect(getByTestId("primaryContactID-select")).toHaveTextContent("John Doe");

    const openAccessCheckbox = getByTestId("openAccess-checkbox") as HTMLInputElement;
    userEvent.click(openAccessCheckbox);

    userEvent.click(saveButton);

    // Wait for the checkboxes to become disabled
    await waitFor(() => {
      expect(openAccessCheckbox).toBeDisabled();
      const controlledAccessCheckbox = getByTestId("controlledAccess-checkbox") as HTMLInputElement;
      expect(controlledAccessCheckbox).toBeDisabled();
    });

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("This study has been successfully added.", {
        variant: "default",
      });
    });
  });

  it("navigates to manage studies page with error when GET_APPROVED_STUDY query fails", async () => {
    const studyId = "non-existent-study-id";

    const getApprovedStudyMock: MockedResponse<GetApprovedStudyResp, GetApprovedStudyInput> = {
      request: {
        query: GET_APPROVED_STUDY,
        variables: { _id: studyId },
      },
      error: new ApolloError({ errorMessage: null }),
    };

    render(
      <TestParent mocks={[listActiveDCPsMock, getApprovedStudyMock]}>
        <StudyView _id={studyId} />
      </TestParent>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/studies", {
        state: { error: "Unable to fetch study." },
      });
    });
  });

  it("does not set form values for fields that are null", async () => {
    const studyId = "study-with-null-fields";
    const getApprovedStudyMock = {
      request: {
        query: GET_APPROVED_STUDY,
        variables: { _id: studyId },
      },
      result: {
        data: {
          getApprovedStudy: {
            _id: studyId,
            studyName: "Study With Null Fields",
            studyAbbreviation: null,
            PI: null,
            dbGaPID: "db123456",
            ORCID: "0000-0001-2345-6789",
            openAccess: true,
            controlledAccess: false,
          },
        },
      },
    };

    const { getByTestId } = render(
      <TestParent mocks={[listActiveDCPsMock, getApprovedStudyMock]}>
        <StudyView _id={studyId} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("studyName-input")).toHaveValue("Study With Null Fields");
      expect(getByTestId("studyAbbreviation-input")).toHaveValue("");
      expect(getByTestId("PI-input")).toHaveValue("");
      expect(getByTestId("dbGaPID-input")).toHaveValue("db123456");
    });
  });

  it("navigates back to manage studies page when cancel button is clicked", () => {
    const { getByTestId } = render(
      <TestParent>
        <StudyView _id="new" />
      </TestParent>
    );

    const cancelButton = getByTestId("cancel-button");
    userEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith("/studies");
  });

  it("sets error message when createApprovedStudy mutation fails", async () => {
    const createApprovedStudyMock: MockedResponse<
      CreateApprovedStudyResp,
      CreateApprovedStudyInput
    > = {
      request: {
        query: CREATE_APPROVED_STUDY,
        variables: {
          PI: "John Doe",
          dbGaPID: "",
          ORCID: "0000-0001-2345-6789",
          openAccess: true,
          controlledAccess: false,
          name: "Test Study Name",
          acronym: "",
          primaryContactID: "dcp-1",
          useProgramPC: false,
        },
      },
      error: new ApolloError({ errorMessage: null }),
    };

    const { getByTestId } = render(
      <TestParent mocks={[listActiveDCPsMock, createApprovedStudyMock]}>
        <StudyView _id="new" />
      </TestParent>
    );

    const studyNameInput = getByTestId("studyName-input") as HTMLInputElement;
    const PIInput = getByTestId("PI-input") as HTMLInputElement;
    const ORCIDInput = getByTestId("ORCID-input") as HTMLInputElement;
    const openAccessCheckbox = getByTestId("openAccess-checkbox") as HTMLInputElement;
    const sameAsProgramPrimaryContactCheckbox = getByTestId("sameAsProgramPrimaryContact-checkbox");
    const primaryContactIDSelect = within(getByTestId("primaryContactID-select")).getByRole(
      "button"
    );
    const saveButton = getByTestId("save-button");

    userEvent.type(studyNameInput, "Test Study Name");
    userEvent.type(PIInput, "John Doe");
    userEvent.type(ORCIDInput, "0000-0001-2345-6789");
    userEvent.click(sameAsProgramPrimaryContactCheckbox);
    userEvent.click(openAccessCheckbox);
    userEvent.click(primaryContactIDSelect);

    await waitFor(() => {
      const muiSelectOptions = within(getByTestId("primaryContactID-select")).getAllByRole(
        "option",
        {
          hidden: true,
        }
      );
      expect(muiSelectOptions[0]).toHaveTextContent("<Not Set>");
      expect(muiSelectOptions[1]).toHaveTextContent("John Doe");
      expect(muiSelectOptions[2]).toHaveTextContent("James Smith");
    });

    userEvent.selectOptions(
      within(getByTestId("primaryContactID-select")).getByRole("listbox", {
        hidden: true,
      }),
      "John Doe"
    );

    expect(getByTestId("primaryContactID-select")).toHaveTextContent("John Doe");

    userEvent.click(saveButton);

    await waitFor(() => {
      expect(getByTestId("alert-error-message")).toHaveTextContent(
        "Unable to create approved study."
      );
    });
  });

  it("sets error message when updateApprovedStudy mutation fails", async () => {
    const studyId = "existing-study-id";
    const getApprovedStudyMock: MockedResponse<GetApprovedStudyResp, GetApprovedStudyInput> = {
      request: {
        query: GET_APPROVED_STUDY,
        variables: { _id: studyId },
      },
      result: {
        data: {
          getApprovedStudy: {
            _id: studyId,
            studyName: "Existing Study",
            studyAbbreviation: "ES",
            PI: "Jane Smith",
            dbGaPID: "db654321",
            ORCID: "0000-0002-3456-7890",
            openAccess: false,
            controlledAccess: true,
            programs: [
              {
                _id: "program-1",
                conciergeID: "primary-contact-1",
                conciergeName: "John Doe",
                name: "",
              },
            ],
            primaryContact: null,
            useProgramPC: true,
            createdAt: "",
          },
        },
      },
    };

    const updateApprovedStudyMock: MockedResponse<
      UpdateApprovedStudyResp,
      UpdateApprovedStudyInput
    > = {
      request: {
        query: UPDATE_APPROVED_STUDY,
        variables: {
          studyID: studyId,
          PI: "Jane Smith",
          dbGaPID: "db654321",
          ORCID: "0000-0002-3456-7890",
          openAccess: false,
          controlledAccess: true,
          name: "Updated Study Name",
          acronym: "ES",
          primaryContactID: undefined,
          useProgramPC: true,
        },
      },
      error: new ApolloError({ errorMessage: null }),
    };

    const { getByTestId } = render(
      <TestParent mocks={[listActiveDCPsMock, getApprovedStudyMock, updateApprovedStudyMock]}>
        <StudyView _id={studyId} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("studyName-input")).toHaveValue("Existing Study");
    });

    const studyNameInput = getByTestId("studyName-input") as HTMLInputElement;
    const saveButton = getByTestId("save-button");

    userEvent.clear(studyNameInput);
    userEvent.type(studyNameInput, "Updated Study Name");

    userEvent.click(saveButton);

    await waitFor(() => {
      expect(getByTestId("alert-error-message")).toHaveTextContent("Unable to save changes");
    });
  });
});
