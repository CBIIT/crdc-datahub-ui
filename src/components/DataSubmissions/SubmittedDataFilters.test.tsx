import { FC } from "react";
import { render, waitFor, within } from "@testing-library/react";
import UserEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import SubmittedDataFilters from "./SubmittedDataFilters";
import { SUBMISSION_STATS, SubmissionStatsInput, SubmissionStatsResp } from "../../graphql";

type ParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ mocks, children }: ParentProps) => (
  <MockedProvider mocks={mocks} showWarnings>
    {children}
  </MockedProvider>
);

describe("SubmittedDataFilters cases", () => {
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const baseStatistic: SubmissionStatistic = {
    nodeName: "",
    total: 0,
    new: 0,
    passed: 0,
    warning: 0,
    error: 0,
  };

  it("should not have accessibility violations", async () => {
    const { container } = render(
      <TestParent mocks={[]}>
        <SubmittedDataFilters submissionId={undefined} />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should handle an empty array of node types without errors", async () => {
    const _id = "example-empty-results";
    const mocks: MockedResponse<SubmissionStatsResp, SubmissionStatsInput>[] = [
      {
        request: {
          query: SUBMISSION_STATS,
          variables: { id: _id },
        },
        result: {
          data: {
            submissionStats: {
              stats: [],
            },
          },
        },
      },
    ];

    expect(() =>
      render(
        <TestParent mocks={mocks}>
          <SubmittedDataFilters submissionId={_id} />
        </TestParent>
      )
    ).not.toThrow();
  });

  // NOTE: The sorting function `compareNodeStats` is already heavily tested, this is just a sanity check
  it("should sort the node types by count in ascending order", async () => {
    const _id = "example-sorting-by-count-id";
    const mocks: MockedResponse<SubmissionStatsResp, SubmissionStatsInput>[] = [
      {
        request: {
          query: SUBMISSION_STATS,
          variables: {
            id: _id,
          },
        },
        result: {
          data: {
            submissionStats: {
              stats: [
                { ...baseStatistic, nodeName: "N-3", total: 1 },
                { ...baseStatistic, nodeName: "N-1", total: 3 },
                { ...baseStatistic, nodeName: "N-2", total: 2 },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <SubmittedDataFilters submissionId={_id} />
      </TestParent>
    );

    const muiSelectBox = within(getByTestId("data-content-node-filter")).getByRole("button");

    UserEvent.click(muiSelectBox);

    await waitFor(() => {
      const muiSelectList = within(getByTestId("data-content-node-filter")).getByRole("listbox", {
        hidden: true,
      });

      // The order of the nodes should be N-3, N-2, N-1
      expect(muiSelectList).toBeInTheDocument();
      expect(muiSelectList.innerHTML.search("N-3")).toBeLessThan(
        muiSelectList.innerHTML.search("N-2")
      );
      expect(muiSelectList.innerHTML.search("N-2")).toBeLessThan(
        muiSelectList.innerHTML.search("N-1")
      );
    });
  });

  it("should select the first sorted node type in the by default", async () => {
    const _id = "example-select-first-node-id";
    const mocks: MockedResponse<SubmissionStatsResp, SubmissionStatsInput>[] = [
      {
        request: {
          query: SUBMISSION_STATS,
          variables: {
            id: _id,
          },
        },
        result: {
          data: {
            submissionStats: {
              stats: [
                { ...baseStatistic, nodeName: "SECOND", total: 3 },
                { ...baseStatistic, nodeName: "THIRD", total: 999 },
                { ...baseStatistic, nodeName: "FIRST", total: 1 },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <SubmittedDataFilters submissionId={_id} />
      </TestParent>
    );

    const muiSelectBox = within(getByTestId("data-content-node-filter")).getByRole("button");

    await waitFor(() => expect(muiSelectBox).toHaveTextContent(/first/i));
  });

  // NOTE: This test used to be the inverse, but we now want to ensure that Data Files are shown
  // Data Files are a special case, as they're common across all Data Models / Data Commons
  it("should show the nodeType 'data file' if present", async () => {
    const mocks: MockedResponse<SubmissionStatsResp, SubmissionStatsInput>[] = [
      {
        request: {
          query: SUBMISSION_STATS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionStats: {
              stats: [
                { ...baseStatistic, nodeName: "Participant", total: 3 },
                { ...baseStatistic, nodeName: "Data File", total: 2 },
                { ...baseStatistic, nodeName: "Sample", total: 1 },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId, getByText, getAllByText } = render(
      <TestParent mocks={mocks}>
        <SubmittedDataFilters submissionId="id-test-filtering-data-file" />
      </TestParent>
    );

    const muiSelectBox = within(getByTestId("data-content-node-filter")).getByRole("button");

    UserEvent.click(muiSelectBox);

    await waitFor(() => {
      // Sanity check that the box is open
      expect(() => getAllByText(/participant/i)).not.toThrow();
      expect(() => getByText(/sample/i)).not.toThrow();
      expect(() => getByText(/data file/i)).not.toThrow();
    });
  });

  it("should always visually render the nodeName as lowercase", async () => {
    const mocks: MockedResponse<SubmissionStatsResp, SubmissionStatsInput>[] = [
      {
        request: {
          query: SUBMISSION_STATS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionStats: {
              stats: [
                { ...baseStatistic, nodeName: "NODE_NAME", total: 1 },
                { ...baseStatistic, nodeName: "Upper_Case", total: 1 },
                { ...baseStatistic, nodeName: "lower_case", total: 1 },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <SubmittedDataFilters submissionId="id-test-filtering-lower-case" />
      </TestParent>
    );

    const muiSelectBox = within(getByTestId("data-content-node-filter")).getByRole("button");

    UserEvent.click(muiSelectBox);

    await waitFor(() => {
      expect(getByTestId("nodeType-NODE_NAME")).toHaveTextContent("node_name");
      expect(getByTestId("nodeType-Upper_Case")).toHaveTextContent("upper_case");
      expect(getByTestId("nodeType-lower_case")).toHaveTextContent("lower_case");
    });
  });

  it("should immediately dispatch NodeType and Status filter changes", async () => {
    const mockOnChange = jest.fn();
    const mocks: MockedResponse<SubmissionStatsResp, SubmissionStatsInput>[] = [
      {
        request: {
          query: SUBMISSION_STATS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionStats: {
              stats: [
                { ...baseStatistic, nodeName: "enrollment", total: 3 },
                { ...baseStatistic, nodeName: "sample", total: 2 },
                { ...baseStatistic, nodeName: "study", total: 1 },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <SubmittedDataFilters submissionId="example-immediate-dispatch" onChange={mockOnChange} />
      </TestParent>
    );

    jest.useFakeTimers();

    const muiSelectBox = within(getByTestId("data-content-node-filter")).getByRole("button");

    UserEvent.click(muiSelectBox);

    await waitFor(() => {
      const muiSelectList = within(getByTestId("data-content-node-filter")).getByRole("listbox", {
        hidden: true,
      });

      expect(within(muiSelectList).getByTestId("nodeType-enrollment")).toBeInTheDocument();
    });

    UserEvent.click(getByTestId("nodeType-study"));

    expect(mockOnChange).toHaveBeenCalled(); // Called without advancing timers
  });

  it("should debounce the submittedID field input", async () => {
    const mockOnChange = jest.fn();
    const mocks: MockedResponse<SubmissionStatsResp, SubmissionStatsInput>[] = [
      {
        request: {
          query: SUBMISSION_STATS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionStats: {
              stats: [
                { ...baseStatistic, nodeName: "enrollment", total: 3 },
                { ...baseStatistic, nodeName: "sample", total: 2 },
                { ...baseStatistic, nodeName: "study", total: 1 },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <SubmittedDataFilters submissionId="example-debounced-dispatch" onChange={mockOnChange} />
      </TestParent>
    );

    jest.useFakeTimers();

    UserEvent.type(getByTestId("data-content-submitted-id-filter"), "id1");
    UserEvent.type(getByTestId("data-content-submitted-id-filter"), " abc 9912");

    expect(mockOnChange).not.toHaveBeenCalled(); // Not called before advancing timers

    jest.advanceTimersByTime(500);

    expect(mockOnChange).toHaveBeenCalledWith({
      nodeType: expect.any(String),
      status: expect.any(String),
      submittedID: "id1 abc 9912",
    }); // Called after advancing timers
  });

  it("should dispatch an empty submittedID field input immediately", async () => {
    const mockOnChange = jest.fn();
    const mocks: MockedResponse<SubmissionStatsResp, SubmissionStatsInput>[] = [
      {
        request: {
          query: SUBMISSION_STATS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionStats: {
              stats: [
                { ...baseStatistic, nodeName: "enrollment", total: 3 },
                { ...baseStatistic, nodeName: "sample", total: 2 },
                { ...baseStatistic, nodeName: "study", total: 1 },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <SubmittedDataFilters submissionId="example-empty-submitted-id" onChange={mockOnChange} />
      </TestParent>
    );

    jest.useFakeTimers();

    UserEvent.type(getByTestId("data-content-submitted-id-filter"), "valid id here");

    jest.advanceTimersByTime(1000);

    expect(mockOnChange).toHaveBeenCalledWith({
      nodeType: expect.any(String),
      status: expect.any(String),
      submittedID: "valid id here",
    });

    UserEvent.type(getByTestId("data-content-submitted-id-filter"), "{backspace}".repeat(14));

    expect(mockOnChange).toHaveBeenCalledWith({
      nodeType: expect.any(String),
      status: expect.any(String),
      submittedID: "",
    }); // Called immediately after clearing the input without advancing timers
  });

  it("should not dispatch a submittedID field with less than 3 characters", async () => {
    const mockOnChange = jest.fn();
    const mocks: MockedResponse<SubmissionStatsResp, SubmissionStatsInput>[] = [
      {
        request: {
          query: SUBMISSION_STATS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionStats: {
              stats: [
                { ...baseStatistic, nodeName: "enrollment", total: 3 },
                { ...baseStatistic, nodeName: "sample", total: 2 },
                { ...baseStatistic, nodeName: "study", total: 1 },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <SubmittedDataFilters submissionId="less-than-3-characters" onChange={mockOnChange} />
      </TestParent>
    );

    jest.useFakeTimers();

    UserEvent.type(getByTestId("data-content-submitted-id-filter"), "1");
    UserEvent.type(getByTestId("data-content-submitted-id-filter"), "2");

    jest.advanceTimersByTime(500);

    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
