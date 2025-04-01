import { FC, useMemo } from "react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { MemoryRouter } from "react-router-dom";
import { axe } from "jest-axe";
import { render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SubmittedData from "./SubmittedData";
import {
  GET_SUBMISSION_NODES,
  GetSubmissionNodesInput,
  GetSubmissionNodesResp,
  SUBMISSION_STATS,
  SubmissionStatsInput,
  SubmissionStatsResp,
} from "../../graphql";
import { SearchParamsProvider } from "../../components/Contexts/SearchParamsContext";
import {
  SubmissionContext,
  SubmissionCtxState,
  SubmissionCtxStatus,
} from "../../components/Contexts/SubmissionContext";
import {
  Context as AuthContext,
  ContextState as AuthContextState,
  Status as AuthContextStatus,
} from "../../components/Contexts/AuthContext";

const baseUser: User = {
  _id: "current-user",
  firstName: "",
  lastName: "",
  userStatus: "Active",
  role: "Submitter", // NOTE: This role has access to everything nested here by default
  IDP: "nih",
  email: "",
  studies: null,
  dataCommons: [],
  createdAt: "",
  updateAt: "",
  permissions: ["data_submission:create"],
  notifications: [],
};

const baseAuthCtx: AuthContextState = {
  status: AuthContextStatus.LOADED,
  isLoggedIn: false,
  user: { ...baseUser },
};

type ParentProps = {
  mocks?: MockedResponse[];
  submissionId?: string;
  submissionName?: string;
  submitterID?: string;
  collaborators?: Collaborator[];
  deletingData?: boolean;
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({
  mocks,
  submissionId,
  submissionName,
  submitterID,
  collaborators = [],
  deletingData = false,
  children,
}: ParentProps) => {
  const value = useMemo<SubmissionCtxState>(
    () => ({
      status: SubmissionCtxStatus.LOADED,
      error: null,
      isPolling: false,
      data: {
        getSubmission: {
          _id: submissionId,
          name: submissionName,
          submitterID,
          collaborators,
          deletingData,
        } as Submission,
        submissionStats: {
          stats: [],
        },
        batchStatusList: null,
      },
    }),
    [submissionId, submissionName, deletingData]
  );

  return (
    <MockedProvider mocks={mocks} showWarnings>
      <MemoryRouter basename="">
        <AuthContext.Provider value={baseAuthCtx}>
          <SubmissionContext.Provider value={value}>
            <SearchParamsProvider>{children}</SearchParamsProvider>
          </SubmissionContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    </MockedProvider>
  );
};

describe("SubmittedData > General", () => {
  const baseSubmissionStatistic: SubmissionStatistic = {
    nodeName: "",
    total: 0,
    new: 0,
    passed: 0,
    warning: 0,
    error: 0,
  };

  const mockSubmissionQuery: MockedResponse<SubmissionStatsResp, SubmissionStatsInput> = {
    request: {
      query: SUBMISSION_STATS,
    },
    variableMatcher: () => true,
    result: {
      data: {
        submissionStats: {
          stats: [{ ...baseSubmissionStatistic, nodeName: "example-node", total: 1 }],
        },
      },
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should not have any high level accessibility violations", async () => {
    const { container } = render(
      <TestParent mocks={[]} submissionId={undefined} submissionName={undefined}>
        <SubmittedData />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should show an error message when the nodes cannot be fetched (network)", async () => {
    const submissionID = "example-sub-id-1";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        error: new Error("Simulated network error"),
      },
    ];

    render(
      <TestParent mocks={mocks} submissionId={submissionID} submissionName={undefined}>
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to retrieve node data.", {
        variant: "error",
      });
    });
  });

  it("should show an error message when the nodes cannot be fetched (GraphQL)", async () => {
    const submissionID = "example-sub-id-2";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          errors: [new GraphQLError("Simulated GraphQL error")],
        },
      },
    ];

    render(
      <TestParent mocks={mocks} submissionId={submissionID} submissionName={undefined}>
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to retrieve node data.", {
        variant: "error",
      });
    });
  });

  it("should show an error message when 'Select All' failed to fetch all nodes (GraphQL)", async () => {
    const getNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      maxUsageCount: 2, // initial query + orderBy bug
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: () => true,
      result: {
        data: {
          getSubmissionNodes: {
            total: 200,
            IDPropName: "col-xyz",
            properties: ["col-xyz"],
            nodes: Array(20).fill({
              nodeType: "example-node",
              nodeID: "example-node-id",
              props: JSON.stringify({
                "col-xyz": "value-for-column-xyz",
              }),
              status: "New",
            }),
          },
        },
      },
    };

    const getAllNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: () => true,
      result: {
        errors: [new GraphQLError("Simulated GraphQL error")],
      },
    };

    const { getAllByRole } = render(
      <TestParent
        mocks={[mockSubmissionQuery, getNodesMock, getAllNodesMock]}
        submissionId="example-select-all-id-failure"
        submissionName={undefined}
      >
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      // NOTE: Default pagination is 20 rows, if that drops below 20, this test will need to be updated
      expect(getAllByRole("checkbox")).toHaveLength(21);
    });

    userEvent.click(getAllByRole("checkbox")[0]); // click 'Select All' checkbox

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Cannot select all rows. Unable to retrieve node data.",
        {
          variant: "error",
        }
      );
    });
  });

  // NOTE: We handle this separately by simply clearing the data and columns
  // This is to support the deletion functionality, where the user may have selected
  // to delete all rows.
  it("should not show an error message when the selected node has 0 results", async () => {
    const getNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: () => true,
      result: {
        data: {
          getSubmissionNodes: {
            total: 0,
            properties: [],
            nodes: [],
          },
        },
      },
    };

    render(
      <TestParent
        mocks={[mockSubmissionQuery, getNodesMock]}
        submissionId="zero-results-id"
        submissionName={undefined}
      >
        <SubmittedData />
      </TestParent>
    );

    await waitFor(
      () => {
        expect(global.mockEnqueue).toHaveBeenCalledTimes(0);
      },
      { timeout: 1000 }
    );
  });

  it("should show an error message when 'Select All' failed to fetch all nodes (network)", async () => {
    const getNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      maxUsageCount: 2, // initial query + orderBy bug
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: () => true,
      result: {
        data: {
          getSubmissionNodes: {
            total: 200,
            properties: ["col-xyz"],
            IDPropName: "col-xyz",
            nodes: Array(20).fill({
              nodeType: "example-node",
              nodeID: "example-node-id",
              props: JSON.stringify({
                "col-xyz": "value-for-column-xyz",
              }),
              status: "New",
            }),
          },
        },
      },
    };

    const getAllNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: () => true,
      error: new Error("Simulated network error"),
    };

    const { getAllByRole } = render(
      <TestParent
        mocks={[mockSubmissionQuery, getNodesMock, getAllNodesMock]}
        submissionId="example-select-all-id-failure"
        submissionName={undefined}
      >
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      // NOTE: Default pagination is 20 rows, if that drops below 20, this test will need to be updated
      expect(getAllByRole("checkbox")).toHaveLength(21);
    });

    userEvent.click(getAllByRole("checkbox")[0]); // click 'Select All' checkbox

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Cannot select all rows. Unable to retrieve node data.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should show a alert box when a data deletion is ongoing", async () => {
    const getNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: () => true,
      result: {
        data: {
          getSubmissionNodes: {
            total: 20,
            properties: ["col-xyz"],
            nodes: Array(20).fill({
              nodeType: "example-node",
              nodeID: "example-node-id",
              props: JSON.stringify({
                "col-xyz": "value-for-column-xyz",
              }),
              status: "New",
            }),
          },
        },
      },
    };

    const { getByTestId, rerender } = render(
      <TestParent
        mocks={[mockSubmissionQuery, getNodesMock]}
        submissionId="sub-delete-alert"
        deletingData
      >
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("submitted-data-deletion-alert")).toBeVisible();
    });

    expect(getByTestId("submitted-data-deletion-alert")).toHaveTextContent(
      "All selected nodes are currently being deleted. Please wait..."
    );

    rerender(
      <TestParent mocks={[]} submissionId="sub-delete-alert" deletingData={false}>
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("submitted-data-deletion-alert")).not.toBeVisible();
    });
  });
});

describe("SubmittedData > Table", () => {
  const baseSubmissionStatistic: SubmissionStatistic = {
    nodeName: "",
    total: 0,
    new: 0,
    passed: 0,
    warning: 0,
    error: 0,
  };

  const mockSubmissionQuery: MockedResponse<SubmissionStatsResp, SubmissionStatsInput> = {
    request: {
      query: SUBMISSION_STATS,
    },
    variableMatcher: () => true,
    result: {
      data: {
        submissionStats: {
          stats: [{ ...baseSubmissionStatistic, nodeName: "example-node", total: 1 }],
        },
      },
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the placeholder text when no data is available", async () => {
    const submissionID = "example-placeholder-test-id";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 0,
              IDPropName: null,
              properties: [],
              nodes: [],
            },
          },
        },
      },
    ];

    const { getByText } = render(
      <TestParent mocks={mocks} submissionId={submissionID} submissionName={undefined}>
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByText("No existing data was found")).toBeInTheDocument();
    });
  });

  it("should render dynamic columns based on the selected node properties", async () => {
    const submissionID = "example-dynamic-columns-id";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        maxUsageCount: 2, // initial query + orderBy bug
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 1,
              IDPropName: "col.2",
              properties: ["col.1", "col.2", "col.3"],
              nodes: [
                {
                  nodeType: "example-node",
                  nodeID: "example-node-id",
                  props: JSON.stringify({
                    "col.1": "value-1",
                    "col.2": "value-2",
                    "col.3": "value-3",
                  }),
                  status: "New",
                },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks} submissionId={submissionID} submissionName={undefined}>
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("generic-table-header-col.1")).toBeInTheDocument();
    });

    expect(getByTestId("generic-table-header-col.2")).toBeInTheDocument();
    expect(getByTestId("generic-table-header-col.3")).toBeInTheDocument();
  });

  it("should arrange columns correctly for 'data file' nodeType", async () => {
    const submissionID = "example-dynamic-columns-id";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        maxUsageCount: 2, // initial query + orderBy bug
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 1,
              IDPropName: "File Name",
              properties: ["Orphaned", "File Size", "Uploaded Date/Time", "File Name"],
              nodes: [
                {
                  nodeType: "data file",
                  nodeID: "example-node-id",
                  props: JSON.stringify({
                    Orphaned: "value-1",
                    "File Size": "value-2",
                    "File Name": "value-3",
                    "Uploaded Date/Time": "value-4",
                  }),
                  status: "New",
                },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId, getAllByTestId } = render(
      <TestParent mocks={mocks} submissionId={submissionID} submissionName={undefined}>
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("generic-table-header-File Name")).toBeInTheDocument();
    });

    const headers = [
      "Select All", // visually hidden
      "File Name",
      "Status",
      "Orphaned",
      "File Size",
      "Uploaded Date/Time",
    ];

    const allHeaders = getAllByTestId(/generic-table-header-/);
    allHeaders.forEach((header, idx) => {
      expect(header).toHaveTextContent(headers[idx]);
    });
  });

  it("should arrange columns correctly for all other nodeTypes", async () => {
    const submissionID = "example-dynamic-columns-id";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        maxUsageCount: 2, // initial query + orderBy bug
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 1,
              IDPropName: "col.2",
              properties: ["col.1", "col.2", "col.3"],
              nodes: [
                {
                  nodeType: "example-node",
                  nodeID: "example-node-id",
                  props: JSON.stringify({
                    "col.1": "value-1",
                    "col.2": "value-2",
                    "col.3": "value-3",
                  }),
                  status: "New",
                },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId, getAllByTestId } = render(
      <TestParent mocks={mocks} submissionId={submissionID} submissionName={undefined}>
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("generic-table-header-col.1")).toBeInTheDocument();
    });

    const headers = [
      "Select All", // visually hidden
      "col.2",
      "Status",
      "col.1",
      "col.3",
    ];

    const allHeaders = getAllByTestId(/generic-table-header-/);
    allHeaders.forEach((header, idx) => {
      expect(header).toHaveTextContent(headers[idx]);
    });
  });

  it("should add the 'Status' column to any node type", async () => {
    const submissionID = "example-status-column-id";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        maxUsageCount: 2, // initial query + orderBy bug
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 2,
              IDPropName: "col-xyz",
              properties: ["col-xyz"],
              nodes: [
                {
                  nodeType: "example-node",
                  nodeID: "example-node-id",
                  props: JSON.stringify({
                    "col-xyz": "value-1",
                  }),
                  status: "New",
                },
                {
                  nodeType: "example-node",
                  nodeID: "example-node-id2",
                  props: JSON.stringify({
                    "col-xyz": "value-2",
                  }),
                  status: null,
                },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks} submissionId={submissionID} submissionName={undefined}>
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("generic-table-header-Status")).toBeInTheDocument();
    });
  });

  it("should append an interactive Checkbox column to the table", async () => {
    const submissionID = "example-checkbox-column-id";

    const mocks: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      maxUsageCount: 2, // initial query + orderBy bug
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: () => true,
      result: {
        data: {
          getSubmissionNodes: {
            total: 2,
            properties: ["col-xyz"],
            IDPropName: "col-xyz",
            nodes: [
              {
                nodeType: "example-node",
                nodeID: "example-node-id",
                props: JSON.stringify({
                  "col-xyz": "value-1",
                }),
                status: "New",
              },
              {
                nodeType: "example-node",
                nodeID: "example-node-id2",
                props: JSON.stringify({
                  "col-xyz": "value-2",
                }),
                status: null,
              },
            ],
          },
        },
      },
    };

    const { getByTestId, getByLabelText, getAllByRole } = render(
      <TestParent
        mocks={[mockSubmissionQuery, mocks]}
        submissionId={submissionID}
        submissionName={undefined}
      >
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("generic-table-header-checkbox")).toBeInTheDocument();
    });

    expect(getByLabelText("Select All")).toBeInTheDocument();

    await waitFor(() => {
      expect(getAllByRole("checkbox")).toHaveLength(3); // header + 2 rows
    });
  });

  it("should enable the checkboxes when user is a collaborator", async () => {
    const getNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      maxUsageCount: 2, // initial query + orderBy bug
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: () => true,
      result: {
        data: {
          getSubmissionNodes: {
            total: 200,
            properties: ["col-xyz"],
            IDPropName: "col-xyz",
            nodes: Array(20).fill({
              nodeType: "example-node",
              nodeID: "example-node-id",
              props: JSON.stringify({
                "col-xyz": "value-for-column-xyz",
              }),
              status: "New",
            }),
          },
        },
      },
    };

    const { getAllByRole, getAllByTestId, getByTestId } = render(
      <TestParent
        mocks={[mockSubmissionQuery, getNodesMock]}
        submissionId="example-select-all-id"
        submissionName={undefined}
        submitterID="some-other-user"
        collaborators={[
          {
            collaboratorID: baseUser._id,
            collaboratorName: "",
            permission: "Can Edit",
          },
        ]}
      >
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      const headerCheckbox = within(getByTestId("header-checkbox")).getByRole("checkbox");
      const rowCheckbox = getAllByTestId("row-checkbox");

      expect(headerCheckbox).toBeEnabled();
      rowCheckbox.forEach((checkbox) =>
        expect(within(checkbox).getByRole("checkbox")).toBeEnabled()
      );

      const checkboxes = getAllByRole("checkbox");
      checkboxes.forEach((checkbox) => expect(checkbox).toBeEnabled());
    });
  });

  it("should fetch all nodes when the 'Select All' checkbox is clicked", async () => {
    const getNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      maxUsageCount: 2, // initial query + orderBy bug
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: () => true,
      result: {
        data: {
          getSubmissionNodes: {
            total: 200,
            properties: ["col-xyz"],
            IDPropName: "col-xyz",
            nodes: Array(20).fill({
              nodeType: "example-node",
              nodeID: "example-node-id",
              props: JSON.stringify({
                "col-xyz": "value-for-column-xyz",
              }),
              status: "New",
            }),
          },
        },
      },
    };

    const mockMatcherAllNodes = jest.fn().mockImplementation(() => true);
    const getAllNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      maxUsageCount: 1,
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: mockMatcherAllNodes,
      result: {
        data: {
          getSubmissionNodes: {
            total: 200,
            nodes: Array(200).fill({
              nodeID: "example-node-id",
            }),
          },
        },
      },
    };

    const { getAllByRole } = render(
      <TestParent
        mocks={[mockSubmissionQuery, getNodesMock, getAllNodesMock]}
        submissionId="example-select-all-id"
        submissionName={undefined}
      >
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      // NOTE: Default pagination is 20 rows, if that drops below 20, this test will need to be updated
      expect(getAllByRole("checkbox")).toHaveLength(21); // header + 20 rows
    });

    expect(mockMatcherAllNodes).not.toHaveBeenCalled();

    userEvent.click(getAllByRole("checkbox")[0]); // click 'Select All' checkbox

    await waitFor(() => {
      expect(mockMatcherAllNodes).toHaveBeenCalledWith(
        expect.objectContaining({
          partial: true,
          first: -1,
        })
      );
    });
  });

  it("should deselect all rows when the 'Select All' checkbox is clicked in the 'indeterminate' state", async () => {
    const submissionID = "example-deselect-all-id";

    const getNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      maxUsageCount: 2, // initial query + orderBy bug
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: () => true,
      result: {
        data: {
          getSubmissionNodes: {
            total: 2,
            properties: ["col-xyz"],
            IDPropName: "col-xyz",
            nodes: [
              {
                nodeType: "example-node",
                nodeID: "example-node-id",
                props: JSON.stringify({
                  "col-xyz": "value-1",
                }),
                status: "New",
              },
              {
                nodeType: "example-node",
                nodeID: "example-node-id2",
                props: JSON.stringify({
                  "col-xyz": "value-2",
                }),
                status: null,
              },
            ],
          },
        },
      },
    };

    const { getAllByRole } = render(
      <TestParent
        mocks={[mockSubmissionQuery, getNodesMock]}
        submissionId={submissionID}
        submissionName={undefined}
      >
        <SubmittedData />
      </TestParent>
    );

    // Wait for the table to render
    await waitFor(() => {
      expect(getAllByRole("checkbox")).toHaveLength(3);
    });

    userEvent.click(getAllByRole("checkbox")[1]); // click 1st row

    await waitFor(() => {
      expect(getAllByRole("checkbox")[0]).toHaveAttribute("data-indeterminate", "true");
    });

    userEvent.click(getAllByRole("checkbox")[0]); // click 'Select All' checkbox (to uncheck all)

    await waitFor(() => {
      expect(getAllByRole("checkbox")[0]).not.toBeChecked();
    });
  });

  it("should deselect all rows when the 'Select All' checkbox is clicked in the 'checked' state", async () => {
    const submissionID = "example-deselect-all-id";

    const getNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      maxUsageCount: 2, // initial query + orderBy bug
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: () => true,
      result: {
        data: {
          getSubmissionNodes: {
            total: 2,
            properties: ["col-xyz"],
            IDPropName: "col-xyz",
            nodes: [
              {
                nodeType: "example-node",
                nodeID: "example-node-id",
                props: JSON.stringify({
                  "col-xyz": "value-1",
                }),
                status: "New",
              },
              {
                nodeType: "example-node",
                nodeID: "example-node-id2",
                props: JSON.stringify({
                  "col-xyz": "value-2",
                }),
                status: null,
              },
            ],
          },
        },
      },
    };

    const { getAllByRole } = render(
      <TestParent
        mocks={[mockSubmissionQuery, getNodesMock]}
        submissionId={submissionID}
        submissionName={undefined}
      >
        <SubmittedData />
      </TestParent>
    );

    // Wait for the table to render
    await waitFor(() => {
      expect(getAllByRole("checkbox")).toHaveLength(3);
    });

    // Manually select all rows
    userEvent.click(getAllByRole("checkbox")[1]);
    userEvent.click(getAllByRole("checkbox")[2]);

    await waitFor(() => {
      expect(getAllByRole("checkbox")[0]).toBeChecked();
    });

    userEvent.click(getAllByRole("checkbox")[0]); // click 'Select All' checkbox (to uncheck all)

    await waitFor(() => {
      expect(getAllByRole("checkbox")[0]).not.toBeChecked();
    });
  });

  it("should not fetch all nodes if the node count is less than the pagination count", async () => {
    const getNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      maxUsageCount: 2, // initial query + orderBy bug
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: () => true,
      result: {
        data: {
          getSubmissionNodes: {
            total: 19,
            properties: ["col-xyz"],
            IDPropName: "col-xyz",
            nodes: Array(19).fill({
              nodeType: "example-node",
              nodeID: "example-node-id",
              props: JSON.stringify({
                "col-xyz": "value-for-column-xyz",
              }),
              status: "New",
            }),
          },
        },
      },
    };

    const mockMatcherAllNodes = jest.fn().mockImplementation(() => true);
    const getAllNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: mockMatcherAllNodes,
      result: {
        data: {
          getSubmissionNodes: {
            total: 19,
            nodes: Array(200).fill({
              nodeID: "example-node-id",
            }),
          },
        },
      },
    };

    const { getAllByRole } = render(
      <TestParent
        mocks={[mockSubmissionQuery, getNodesMock, getAllNodesMock]}
        submissionId="example-select-all-id"
        submissionName={undefined}
      >
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      // NOTE: Default pagination is 20 rows, if that drops below 20, this test will need to be updated
      expect(getAllByRole("checkbox")).toHaveLength(20); // header + 19 rows
    });

    userEvent.click(getAllByRole("checkbox")[0]);

    await waitFor(() => {
      expect(mockMatcherAllNodes).not.toHaveBeenCalled();
    });
  });

  it("should deselect all rows when any filter changes", async () => {
    const submissionID = "example-deselect-all-id";

    const getNodesMock: MockedResponse<GetSubmissionNodesResp, GetSubmissionNodesInput> = {
      maxUsageCount: 3, // initial query + orderBy bug + filter change
      request: {
        query: GET_SUBMISSION_NODES,
      },
      variableMatcher: () => true,
      result: {
        data: {
          getSubmissionNodes: {
            total: 2,
            properties: ["col-xyz"],
            IDPropName: "col-xyz",
            nodes: [
              {
                nodeType: "example-node",
                nodeID: "example-node-id",
                props: JSON.stringify({
                  "col-xyz": "value-1",
                }),
                status: "New",
              },
              {
                nodeType: "example-node",
                nodeID: "example-node-id2",
                props: JSON.stringify({
                  "col-xyz": "value-2",
                }),
                status: null,
              },
            ],
          },
        },
      },
    };

    const { getAllByRole, getByLabelText } = render(
      <TestParent
        mocks={[mockSubmissionQuery, getNodesMock]}
        submissionId={submissionID}
        submissionName={undefined}
      >
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      expect(getAllByRole("checkbox")).toHaveLength(3); // header + 2 rows
    });

    userEvent.click(getAllByRole("checkbox")[1]); // click 'Select All' checkbox

    await waitFor(() => {
      expect(getAllByRole("checkbox")[1]).toBeChecked();
    });

    userEvent.type(getByLabelText("Submitted ID"), "3 characters minimum");

    await waitFor(
      () => {
        expect(getAllByRole("checkbox")[1]).not.toBeChecked();
      },
      { timeout: 8000 }
    );
  });

  // NOTE: We're asserting that the columns ARE built using getSubmissionNodes.properties
  // instead of the keys of nodes.[x].props JSON object
  it("should NOT build the columns based off of the nodes.[X].props JSON object", async () => {
    const submissionID = "example-using-properties-dynamic-columns-id";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        maxUsageCount: 2, // initial query + orderBy bug
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 2,
              IDPropName: "good-col-1",
              properties: ["good-col-1", "good-col-2"],
              nodes: [
                {
                  nodeType: "example-node",
                  nodeID: "example-node-id",
                  props: JSON.stringify({
                    "good-col-1": "ok",
                    "good-col-2": "ok",
                    "bad-column": "bad",
                  }),
                },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId, getByText } = render(
      <TestParent mocks={mocks} submissionId={submissionID} submissionName={undefined}>
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      expect(() => getByTestId("generic-table-header-bad-column")).toThrow();
      expect(() => getByText("bad-column")).toThrow();
    });
  });

  it("should have a default pagination count of 20 rows per page", async () => {
    const submissionID = "example-pagination-default-test-id";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 0,
              IDPropName: null,
              properties: [],
              nodes: [],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks} submissionId={submissionID} submissionName={undefined}>
        <SubmittedData />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("generic-table-rows-per-page-top")).toHaveValue("20");
      expect(getByTestId("generic-table-rows-per-page-bottom")).toHaveValue("20");
    });
  });
});
