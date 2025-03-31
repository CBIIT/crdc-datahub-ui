import React, { FC } from "react";
import { fireEvent, render, waitFor, within } from "@testing-library/react";
import { MemoryRouter, MemoryRouterProps } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { vi } from "vitest";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import ApprovedStudyFilters from "./ApprovedStudyFilters";
import { SearchParamsProvider, useSearchParamsContext } from "../../Contexts/SearchParamsContext";

type ParentProps = {
  mocks?: MockedResponse[];
  initialEntries?: MemoryRouterProps["initialEntries"];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ mocks, initialEntries = ["/"], children }: ParentProps) => (
  <MockedProvider mocks={mocks}>
    <MemoryRouter initialEntries={initialEntries}>
      <SearchParamsProvider>{children}</SearchParamsProvider>
    </MemoryRouter>
  </MockedProvider>
);

describe("ApprovedStudyFilters Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("renders without crashing", () => {
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters />
      </TestParent>
    );
    expect(getByTestId("approved-study-filters")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <TestParent>
        <ApprovedStudyFilters />
      </TestParent>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders all input fields correctly", () => {
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters />
      </TestParent>
    );
    expect(getByTestId("study-input")).toBeInTheDocument();
    expect(getByTestId("dbGaPID-input")).toBeInTheDocument();
    expect(getByTestId("accessType-select")).toBeInTheDocument();
  });

  it("allows users to select an access type", async () => {
    const mockOnChange = vi.fn();
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    const accessTypeSelect = within(getByTestId("accessType-select")).getByRole("button");

    userEvent.click(accessTypeSelect);

    await waitFor(() => {
      const muiSelectList = within(getByTestId("accessType-select")).getByRole("listbox", {
        hidden: true,
      });
      expect(within(muiSelectList).getByTestId("accessType-option-Controlled")).toBeInTheDocument();
      expect(within(muiSelectList).getByTestId("accessType-option-All")).toBeInTheDocument();
      expect(within(muiSelectList).getByTestId("accessType-option-Open")).toBeInTheDocument();
    });

    userEvent.click(getByTestId("accessType-option-Controlled"));

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          accessType: "Controlled",
        })
      );
    });
  });

  it("sets accessType correctly when selecting 'Open'", async () => {
    const mockOnChange = vi.fn();

    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    const accessTypeSelect = within(getByTestId("accessType-select")).getByRole("button");

    userEvent.click(accessTypeSelect);

    await waitFor(() => {
      const muiSelectList = within(getByTestId("accessType-select")).getByRole("listbox", {
        hidden: true,
      });
      expect(within(muiSelectList).getByTestId("accessType-option-Controlled")).toBeInTheDocument();
      expect(within(muiSelectList).getByTestId("accessType-option-All")).toBeInTheDocument();
      expect(within(muiSelectList).getByTestId("accessType-option-Open")).toBeInTheDocument();
    });

    userEvent.click(getByTestId("accessType-option-Open"));

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          accessType: "Open",
        })
      );
    });
  });

  it("deletes 'accessType' from searchParams when accessTypeFilter is set to 'All'", async () => {
    const ShowSearchParams = () => {
      const { searchParams } = useSearchParamsContext();
      return <div data-testid="search-params">{searchParams.toString()}</div>;
    };

    const mockOnChange = vi.fn();

    const { getByTestId } = render(
      <TestParent initialEntries={["/?accessType=Controlled"]}>
        <ApprovedStudyFilters onChange={mockOnChange} />
        <ShowSearchParams />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("search-params")).toHaveTextContent("accessType=Controlled");
    });

    const accessTypeSelect = within(getByTestId("accessType-select")).getByRole("button");

    userEvent.click(accessTypeSelect);

    await waitFor(() => {
      const muiSelectList = within(getByTestId("accessType-select")).getByRole("listbox", {
        hidden: true,
      });
      expect(within(muiSelectList).getByTestId("accessType-option-Controlled")).toBeInTheDocument();
      expect(within(muiSelectList).getByTestId("accessType-option-All")).toBeInTheDocument();
      expect(within(muiSelectList).getByTestId("accessType-option-Open")).toBeInTheDocument();
    });

    userEvent.click(getByTestId("accessType-option-All"));

    // Wait for 'accessType' to be deleted from searchParams
    await waitFor(() => {
      expect(getByTestId("search-params")).not.toHaveTextContent("accessType=All");
      expect(getByTestId("search-params")).not.toHaveTextContent("accessType=Controlled");
    });

    // Ensure 'accessType' is removed from searchParams
    expect(getByTestId("search-params")).not.toHaveTextContent("accessType=");
  });

  it("allows users to type into the study input", async () => {
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters />
      </TestParent>
    );
    const studyInput = getByTestId("study-input");

    userEvent.type(studyInput, "Cancer Study");

    expect(studyInput).toHaveValue("Cancer Study");
  });

  it("allows users to type into the dbGaPID input", async () => {
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters />
      </TestParent>
    );
    const dbGaPIDInput = getByTestId("dbGaPID-input");

    userEvent.type(dbGaPIDInput, "DB12345");

    expect(dbGaPIDInput).toHaveValue("DB12345");
  });

  it("debounces input changes for study and dbGaPID fields", async () => {
    vi.useFakeTimers();
    const mockOnChange = vi.fn();
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    expect(mockOnChange).toHaveBeenCalledWith({
      study: "",
      dbGaPID: "",
      accessType: "All",
    });

    const studyInput = getByTestId("study-input");
    const dbGaPIDInput = getByTestId("dbGaPID-input");

    userEvent.type(studyInput, "Can");
    userEvent.type(dbGaPIDInput, "DB1");

    // Advance timers by less than debounce time (500ms)
    vi.advanceTimersByTime(300);
    expect(mockOnChange).not.toHaveBeenCalledWith(
      expect.objectContaining({
        study: "Can",
        dbGaPID: "DB1",
      })
    );

    // Advance timers to exceed debounce time
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        study: "Can",
        dbGaPID: "DB1",
        accessType: "All",
      });
    });

    vi.useRealTimers();
  });

  it("handles empty input fields correctly", async () => {
    const mockOnChange = vi.fn();
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    const studyInput = getByTestId("study-input");
    const dbGaPIDInput = getByTestId("dbGaPID-input");

    fireEvent.change(studyInput, { target: { value: "" } });
    fireEvent.change(dbGaPIDInput, { target: { value: "" } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        study: "",
        dbGaPID: "",
        accessType: "All",
      });
    });
  });

  it("prevents infinite loops by ensuring setSearchParams is called appropriately", async () => {
    vi.useFakeTimers();
    const mockOnChange = vi.fn();
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    const studyInput = getByTestId("study-input");

    userEvent.clear(studyInput);
    userEvent.type(studyInput, "Test Study");

    // Advance timers to trigger debounce
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledTimes(2);
      expect(mockOnChange).toHaveBeenCalledWith({
        study: "Test Study",
        dbGaPID: "",
        accessType: "All",
      });
    });

    // Ensure no additional calls are made
    vi.advanceTimersByTime(500);
    expect(mockOnChange).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("updates dbGaPID input when searchParams dbGaPID is different", async () => {
    const mockOnChange = vi.fn();
    const { getByTestId } = render(
      <TestParent initialEntries={["/test?dbGaPID=DB123"]}>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    const dbGaPIDInput = getByTestId("dbGaPID-input");

    await waitFor(() => {
      expect(dbGaPIDInput).toHaveValue("DB123");
    });

    expect(mockOnChange).toHaveBeenCalledWith({
      study: "",
      dbGaPID: "DB123",
      accessType: "All",
    });
  });

  it("updates accessType dropdown when searchParams accessType is different", async () => {
    const mockOnChange = vi.fn();

    const { getByTestId } = render(
      <TestParent initialEntries={["/test?accessType=Controlled"]}>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    const accessTypeSelect = getByTestId("accessType-select");

    await waitFor(() => {
      expect(accessTypeSelect).toHaveTextContent("Controlled");
    });

    expect(mockOnChange).toHaveBeenCalledWith({
      study: "",
      dbGaPID: "",
      accessType: "Controlled",
    });
  });

  it("handles accessTypeFilter being 'All' correctly when study equals studyFilter", async () => {
    const mockOnChange = vi.fn();

    const { getByTestId } = render(
      <TestParent initialEntries={["/?study=Study1&accessType=All"]}>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    const studyInput = getByTestId("study-input");
    const accessTypeSelect = getByTestId("accessType-select");

    await waitFor(() => {
      expect(studyInput).toHaveValue("Study1");
    });

    expect(accessTypeSelect).toHaveTextContent("All");

    expect(mockOnChange).toHaveBeenCalledWith({
      study: "Study1",
      dbGaPID: "",
      accessType: "All",
    });
  });

  it("handles invalid accessTypeFilter value in searchParams correctly", async () => {
    const mockOnChange = vi.fn();

    const { getByTestId } = render(
      <TestParent initialEntries={["/?study=Study1&accessType=invalid-access-type"]}>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    const accessTypeSelect = getByTestId("accessType-select");

    expect(accessTypeSelect).toHaveTextContent("All");
    expect(mockOnChange).toHaveBeenCalledWith({
      study: "Study1",
      dbGaPID: "",
      accessType: "All",
    });
  });
});
