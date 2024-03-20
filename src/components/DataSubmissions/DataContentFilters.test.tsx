import { render, waitFor, within } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DataContentFilters } from './DataContentFilters';

describe("DataContentFilters cases", () => {
  const baseStatistic: SubmissionStatistic = {
    nodeName: "",
    total: 0,
    new: 0,
    passed: 0,
    warning: 0,
    error: 0
  };

  it("should not have accessibility violations", async () => {
    const { container } = render(
      <DataContentFilters statistics={[]} />
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it("should handle an empty array of node types without errors", async () => {
    expect(() => render(<DataContentFilters statistics={[]} />)).not.toThrow();
  });

  // NOTE: The sorting function `compareNodeStats` is already heavily tested, this is just a sanity check
  it("should sort the node types by count in descending order", async () => {
    const stats: SubmissionStatistic[] = [
      { ...baseStatistic, nodeName: "N-3", total: 1 },
      { ...baseStatistic, nodeName: "N-1", total: 3 },
      { ...baseStatistic, nodeName: "N-2", total: 2 },
    ];

    const { getByTestId } = render(<DataContentFilters statistics={stats} />);

    const muiSelectBox = within(getByTestId("data-content-node-filter")).getByRole("button");

    await waitFor(() => {
      UserEvent.click(muiSelectBox);

      const muiSelectList = within(getByTestId("data-content-node-filter")).getByRole("listbox", { hidden: true });

      // The order of the nodes should be N-1 < N-2 < N-3
      expect(muiSelectList).toBeInTheDocument();
      expect(muiSelectList.innerHTML.search("N-1")).toBeLessThan(muiSelectList.innerHTML.search("N-2"));
      expect(muiSelectList.innerHTML.search("N-2")).toBeLessThan(muiSelectList.innerHTML.search("N-3"));
    });
  });

  it("should select the first sorted node type in the by default", async () => {
    const stats: SubmissionStatistic[] = [
      { ...baseStatistic, nodeName: "SECOND", total: 3 },
      { ...baseStatistic, nodeName: "FIRST", total: 999 },
      { ...baseStatistic, nodeName: "THIRD", total: 1 },
    ];

    const { getByTestId } = render(<DataContentFilters statistics={stats} />);
    const muiSelectBox = within(getByTestId("data-content-node-filter")).getByRole("button");

    expect(muiSelectBox).toHaveTextContent("FIRST");
  });

  it("should update the empty selection when the node types are populated", async () => {
    const stats: SubmissionStatistic[] = [
      { ...baseStatistic, nodeName: "FIRST-NODE", total: 999 },
      { ...baseStatistic, nodeName: "SECOND", total: 3 },
      { ...baseStatistic, nodeName: "THIRD", total: 1 },
    ];

    const { getByTestId, rerender } = render(<DataContentFilters statistics={[]} />);
    const muiSelectBox = within(getByTestId("data-content-node-filter")).getByRole("button");

    rerender(<DataContentFilters statistics={stats} />);

    expect(muiSelectBox).toHaveTextContent("FIRST-NODE");
  });

  it("should not change a NON-DEFAULT selection when the node types are updated", async () => {
    const stats: SubmissionStatistic[] = [
      { ...baseStatistic, nodeName: "FIRST", total: 100 },
      { ...baseStatistic, nodeName: "SECOND", total: 2 },
      { ...baseStatistic, nodeName: "THIRD", total: 1 },
    ];

    const { getByTestId, rerender } = render(<DataContentFilters statistics={stats} />);
    const muiSelectBox = within(getByTestId("data-content-node-filter")).getByRole("button");

    await waitFor(() => {
      expect(muiSelectBox).toHaveTextContent("FIRST");
    });

    // Open the dropdown
    await waitFor(() => UserEvent.click(muiSelectBox));

    // Select the 3rd option
    const firstOption = getByTestId("nodeType-THIRD");
    await waitFor(() => UserEvent.click(firstOption));

    const newStats: SubmissionStatistic[] = [
      ...stats,
      { ...baseStatistic, nodeName: "NEW-FIRST", total: 999 },
    ];

    rerender(<DataContentFilters statistics={newStats} />);

    await waitFor(() => {
      // Verify the 3rd option is still selected
      expect(muiSelectBox).toHaveTextContent("THIRD");
    });
  });
});
