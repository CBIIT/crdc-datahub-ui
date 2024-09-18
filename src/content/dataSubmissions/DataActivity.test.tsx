import { FC } from "react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { MemoryRouter } from "react-router-dom";
import { axe } from "jest-axe";
import { render, waitFor } from "@testing-library/react";
import DataActivity from "./DataActivity";
import { LIST_BATCHES, ListBatchesResp } from "../../graphql";
import * as SubmissionCtx from "../../components/Contexts/SubmissionContext";
import { SubmissionCtxStatus } from "../../components/Contexts/SubmissionContext";
import { SearchParamsProvider } from "../../components/Contexts/SearchParamsContext";

// NOTE: We omit all properties that the component specifically depends on
const baseSubmission: Omit<Submission, "_id"> = {
  name: "",
  submitterID: "",
  submitterName: "",
  organization: null,
  dataCommons: "",
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
  status: "New",
  metadataValidationStatus: "New",
  fileValidationStatus: "New",
  studyID: "",
  deletingData: false,
};

type ParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ mocks, children }: ParentProps) => (
  <MemoryRouter basename="">
    <MockedProvider mocks={mocks} showWarnings>
      <SearchParamsProvider>{children}</SearchParamsProvider>
    </MockedProvider>
  </MemoryRouter>
);

describe("General", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should not have any accessibility violations", async () => {
    jest.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADING,
      data: {
        getSubmission: {
          _id: "",
          ...baseSubmission,
        },
        submissionStats: {
          stats: [],
        },
        batchStatusList: {
          batches: [],
        },
      },
      error: null,
    });

    const mocks: MockedResponse<ListBatchesResp>[] = [
      {
        request: {
          query: LIST_BATCHES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            listBatches: {
              total: 0,
              batches: [],
            },
            batchStatusList: {
              batches: [],
            },
          },
        },
      },
    ];

    const { container } = render(<DataActivity ref={null} />, {
      wrapper: ({ children }) => <TestParent mocks={mocks}>{children}</TestParent>,
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it.todo("should refetch data when the submission ID changes");

  it("should show an error message when the batches cannot be fetched (network)", async () => {
    jest.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADED,
      data: {
        getSubmission: {
          _id: "simulated-network-error",
          ...baseSubmission,
        },
        submissionStats: null,
        batchStatusList: null,
      },
      error: null,
      refetch: null,
    });

    const mocks: MockedResponse<ListBatchesResp>[] = [
      {
        request: {
          query: LIST_BATCHES,
        },
        variableMatcher: () => true,
        error: new Error("Simulated network error"),
      },
    ];

    render(<DataActivity />, {
      wrapper: ({ children }) => <TestParent mocks={mocks}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to retrieve batch data.", {
        variant: "error",
      });
    });
  });

  it("should show an error message when the batches cannot be fetched (GraphQL)", async () => {
    jest.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADED,
      data: {
        getSubmission: {
          _id: "simulated-graphql-error",
          ...baseSubmission,
        },
        submissionStats: null,
        batchStatusList: null,
      },
      error: null,
      refetch: null,
    });

    const mocks: MockedResponse<ListBatchesResp>[] = [
      {
        request: {
          query: LIST_BATCHES,
        },
        variableMatcher: () => true,
        result: {
          errors: [new GraphQLError("Simulated GraphQL error")],
        },
      },
    ];

    render(<DataActivity />, {
      wrapper: ({ children }) => <TestParent mocks={mocks}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to retrieve batch data.", {
        variant: "error",
      });
    });
  });

  it("should not crash when no submission is available", async () => {
    jest.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADED,
      data: null,
      error: null,
    });

    const { container } = render(<DataActivity />, {
      wrapper: ({ children }) => <TestParent>{children}</TestParent>,
    });

    expect(container).toBeInTheDocument();
  });
});

describe("Table", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the placeholder text when no data is available", async () => {
    jest.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADED,
      data: {
        getSubmission: {
          _id: "",
          ...baseSubmission,
        },
        submissionStats: {
          stats: [],
        },
        batchStatusList: {
          batches: [],
        },
      },
      error: null,
    });

    const mocks: MockedResponse<ListBatchesResp>[] = [
      {
        request: {
          query: LIST_BATCHES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            listBatches: {
              total: 0,
              batches: [],
            },
            batchStatusList: {
              batches: [],
            },
          },
        },
      },
    ];

    const { getByText } = render(<DataActivity ref={null} />, {
      wrapper: ({ children }) => <TestParent mocks={mocks}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(getByText(/No existing data was found/i)).toBeInTheDocument();
    });
  });

  it.todo("should have an interactive file count column");

  it.todo("should display an interactive upload errors column");

  it.todo("should use the correct pluralization for the error count of %p");

  // NOTE: This only happens when isPolling is false
  it("should refetch the submission if there are uploading batches", async () => {
    const mockRefetch = jest.fn();
    jest.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADED,
      data: {
        getSubmission: {
          _id: "refetching-submission-test",
          ...baseSubmission,
        },
        submissionStats: {
          stats: [],
        },
        batchStatusList: {
          batches: [],
        },
      },
      error: null,
      refetch: mockRefetch,
    });

    const mocks: MockedResponse<ListBatchesResp>[] = [
      {
        request: {
          query: LIST_BATCHES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            listBatches: {
              total: 0,
              batches: [], // NOTE: This shouldn't really be empty, but it's fine for this test
            },
            batchStatusList: {
              batches: [
                {
                  _id: "batch-001",
                  status: "Uploading",
                },
              ],
            },
          },
        },
      },
    ];

    render(<DataActivity ref={null} />, {
      wrapper: ({ children }) => <TestParent mocks={mocks}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  it("should not refetch the submission if the submission is already polling", async () => {
    const mockRefetch = jest.fn();
    jest.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.POLLING,
      data: {
        getSubmission: {
          _id: "refetching-submission-test",
          ...baseSubmission,
        },
        submissionStats: {
          stats: [],
        },
        batchStatusList: {
          batches: [],
        },
      },
      error: null,
      refetch: mockRefetch,
    });

    const mocks: MockedResponse<ListBatchesResp>[] = [
      {
        request: {
          query: LIST_BATCHES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            listBatches: {
              total: 0,
              batches: [], // NOTE: This shouldn't really be empty, but it's fine for this test
            },
            batchStatusList: {
              batches: [
                {
                  _id: "batch-001",
                  status: "Uploading",
                },
              ],
            },
          },
        },
      },
    ];

    render(<DataActivity ref={null} />, {
      wrapper: ({ children }) => <TestParent mocks={mocks}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });

  it("should have a default pagination count of 20 rows per page", async () => {
    jest.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADED,
      data: {
        getSubmission: {
          _id: "",
          ...baseSubmission,
        },
        submissionStats: {
          stats: [],
        },
        batchStatusList: {
          batches: [],
        },
      },
      error: null,
    });

    const mocks: MockedResponse<ListBatchesResp>[] = [
      {
        request: {
          query: LIST_BATCHES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            listBatches: {
              total: 0,
              batches: [],
            },
            batchStatusList: {
              batches: [],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(<DataActivity ref={null} />, {
      wrapper: ({ children }) => <TestParent mocks={mocks}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(getByTestId("generic-table-rows-per-page-bottom")).toHaveValue("20");
    });
  });
});
