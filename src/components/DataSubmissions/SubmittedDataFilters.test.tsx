import { FC } from "react";
import { render, waitFor, within } from "@testing-library/react";
import UserEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { act } from "react-dom/test-utils";
import { SubmittedDataFilters } from "./SubmittedDataFilters";
import { SUBMISSION_STATS, SubmissionStatsResp } from "../../graphql";

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
    const mocks: MockedResponse<SubmissionStatsResp>[] = [
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
  it("should sort the node types by count in descending order", async () => {
    const _id = "example-sorting-by-count-id";
    const mocks: MockedResponse<SubmissionStatsResp>[] = [
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

    await waitFor(() => {
      UserEvent.click(muiSelectBox);

      const muiSelectList = within(getByTestId("data-content-node-filter")).getByRole("listbox", {
        hidden: true,
      });

      // The order of the nodes should be N-1 < N-2 < N-3
      expect(muiSelectList).toBeInTheDocument();
      expect(muiSelectList.innerHTML.search("N-1")).toBeLessThan(
        muiSelectList.innerHTML.search("N-2")
      );
      expect(muiSelectList.innerHTML.search("N-2")).toBeLessThan(
        muiSelectList.innerHTML.search("N-3")
      );
    });
  });

  it("should select the first sorted node type in the by default", async () => {
    const _id = "example-select-first-node-id";
    const mocks: MockedResponse<SubmissionStatsResp>[] = [
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
                { ...baseStatistic, nodeName: "FIRST", total: 999 },
                { ...baseStatistic, nodeName: "THIRD", total: 1 },
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

    await waitFor(() => expect(muiSelectBox).toHaveTextContent("FIRST"));
  });

  it("should NOT show the nodeType 'Data File'", async () => {
    const mocks: MockedResponse<SubmissionStatsResp>[] = [
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
                { ...baseStatistic, nodeName: "File", total: 1 },
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

    await act(async () => UserEvent.click(muiSelectBox));

    await waitFor(() => {
      // Sanity check that the box is open
      expect(() => getAllByText(/participant/i)).not.toThrow();
      expect(() => getByText(/file/i)).not.toThrow();
      // This should throw an error
      expect(() => getByText(/data file/i)).toThrow();
    });
  });

  // NOTE: This test no longer applies since the component fetches it's own data.
  // it("should update the empty selection when the node types are populated", async () => {
  //   const stats: SubmissionStatistic[] = [
  //     { ...baseStatistic, nodeName: "FIRST-NODE", total: 999 },
  //     { ...baseStatistic, nodeName: "SECOND", total: 3 },
  //     { ...baseStatistic, nodeName: "THIRD", total: 1 },
  //   ];

  //   const { getByTestId, rerender } = render(<SubmittedDataFilters statistics={[]} />);
  //   const muiSelectBox = within(getByTestId("data-content-node-filter")).getByRole("button");

  //   rerender(<SubmittedDataFilters statistics={stats} />);

  //   expect(muiSelectBox).toHaveTextContent("FIRST-NODE");
  // });

  // NOTE: This test no longer applies since the component fetches it's own data.
  // it("should not change a NON-DEFAULT selection when the node types are updated", async () => {
  //   const stats: SubmissionStatistic[] = [
  //     { ...baseStatistic, nodeName: "FIRST", total: 100 },
  //     { ...baseStatistic, nodeName: "SECOND", total: 2 },
  //     { ...baseStatistic, nodeName: "THIRD", total: 1 },
  //   ];

  //   const { getByTestId, rerender } = render(<SubmittedDataFilters statistics={stats} />);
  //   const muiSelectBox = within(getByTestId("data-content-node-filter")).getByRole("button");

  //   await waitFor(() => {
  //     expect(muiSelectBox).toHaveTextContent("FIRST");
  //   });

  //   // Open the dropdown
  //   await waitFor(() => UserEvent.click(muiSelectBox));

  //   // Select the 3rd option
  //   const firstOption = getByTestId("nodeType-THIRD");
  //   await waitFor(() => UserEvent.click(firstOption));

  //   const newStats: SubmissionStatistic[] = [
  //     ...stats,
  //     { ...baseStatistic, nodeName: "NEW-FIRST", total: 999 },
  //   ];

  //   rerender(<SubmittedDataFilters statistics={newStats} />);

  //   await waitFor(() => {
  //     // Verify the 3rd option is still selected
  //     expect(muiSelectBox).toHaveTextContent("THIRD");
  //   });
  // });
});
