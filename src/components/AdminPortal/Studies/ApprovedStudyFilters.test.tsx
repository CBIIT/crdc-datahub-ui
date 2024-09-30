import React, { FC } from "react";
import { fireEvent, render, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import ApprovedStudyFilters from "./ApprovedStudyFilters";
import { SearchParamsProvider } from "../../Contexts/SearchParamsContext";

type ParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ mocks, children }: ParentProps) => (
  <MockedProvider mocks={mocks}>
    <MemoryRouter basename="">
      <SearchParamsProvider>{children}</SearchParamsProvider>
    </MemoryRouter>
  </MockedProvider>
);

describe("ApprovedStudyFilters Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
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
    const mockOnChange = jest.fn();
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

    // Await the userEvent.click for the option as well
    userEvent.click(getByTestId("accessType-option-Controlled"));

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          accessType: "Controlled",
        })
      );
    });
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
    jest.useFakeTimers();
    const mockOnChange = jest.fn();
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
    jest.advanceTimersByTime(300);
    expect(mockOnChange).not.toHaveBeenCalledWith(
      expect.objectContaining({
        study: "Can",
        dbGaPID: "DB1",
      })
    );

    // Advance timers to exceed debounce time
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        study: "Can",
        dbGaPID: "DB1",
        accessType: "All",
      });
    });

    jest.useRealTimers();
  });

  it("does not debounce input changes below minCharacters", async () => {
    jest.useFakeTimers();
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    const studyInput = getByTestId("study-input");
    const dbGaPIDInput = getByTestId("dbGaPID-input");

    // Assuming minCharacters is 3 for debouncing
    userEvent.type(studyInput, "Ca");
    userEvent.type(dbGaPIDInput, "D");

    // Advance timers beyond debounce time
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        study: "Ca",
        dbGaPID: "D",
        accessType: "All",
      });
    });

    jest.useRealTimers();
  });

  it("handles empty input fields correctly", async () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    const studyInput = getByTestId("study-input");
    const dbGaPIDInput = getByTestId("dbGaPID-input");

    // Clear inputs
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
    jest.useFakeTimers();
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    const studyInput = getByTestId("study-input");

    // Rapidly type into the study input
    userEvent.type(studyInput, "Test Study");

    // Advance timers to trigger debounce
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledTimes(2);
      expect(mockOnChange).toHaveBeenCalledWith({
        study: "Test Study",
        dbGaPID: "",
        accessType: "All",
      });
    });

    // Ensure no additional calls are made
    jest.advanceTimersByTime(500);
    expect(mockOnChange).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });
});
