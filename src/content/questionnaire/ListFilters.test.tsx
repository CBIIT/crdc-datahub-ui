import { render, fireEvent, waitFor, act, within } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import ListFilters, { defaultValues, DEFAULT_STATUSES_SELECTED } from "./ListFilters";
import type { FilterForm } from "./ListFilters";

const mockApplicationData = {
  total: 1,
  applications: [],
  programs: ["Program A", "Program B"],
  studies: [],
  status: ["New", "Submitted"],
  submitterNames: [],
};

describe("Accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ListFilters applicationData={mockApplicationData} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("ListFilters Component", () => {
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("renders all filter fields with correct labels and placeholders", () => {
    const { getByText, getByTestId, getByPlaceholderText } = render(
      <ListFilters applicationData={mockApplicationData} />
    );

    expect(getByText(/Submitter Name/i)).toBeInTheDocument();
    expect(getByText(/Program/i)).toBeInTheDocument();
    expect(getByText(/Study/i)).toBeInTheDocument();
    expect(getByText(/Status/i)).toBeInTheDocument();

    expect(getByTestId("submitter-name-input")).toBeInTheDocument();
    expect(getByTestId("study-name-input")).toBeInTheDocument();
    expect(getByPlaceholderText(/Select programs/i)).toBeInTheDocument();
    expect(getByTestId("application-status-filter")).toBeInTheDocument();
  });

  it("calls onChange callback after debounced input changes with valid values", async () => {
    jest.useFakeTimers();

    const onChangeMock = jest.fn();
    const { getByTestId } = render(
      <ListFilters applicationData={mockApplicationData} onChange={onChangeMock} />
    );

    const submitterInput = getByTestId("submitter-name-input") as HTMLInputElement;
    const studyInput = getByTestId("study-name-input") as HTMLInputElement;

    userEvent.type(submitterInput, "John Doe");
    userEvent.type(studyInput, "StudyX");

    jest.advanceTimersByTime(500);

    // Wait for the debounced callback to fire
    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalled();
    });

    const expectedForm: FilterForm = {
      programName: defaultValues.programName,
      studyName: "StudyX",
      statuses: DEFAULT_STATUSES_SELECTED,
      submitterName: "John Doe",
    };
    expect(onChangeMock).toHaveBeenCalledWith(expectedForm);
  });

  it("sends empty strings for submitterName and studyName if input length is less than 3", async () => {
    jest.useFakeTimers();

    const onChangeMock = jest.fn();
    const { getByTestId } = render(
      <ListFilters applicationData={mockApplicationData} onChange={onChangeMock} />
    );

    const submitterInput = getByTestId("submitter-name-input") as HTMLInputElement;
    const studyInput = getByTestId("study-name-input") as HTMLInputElement;

    userEvent.type(submitterInput, "Jo");
    userEvent.type(studyInput, "St");

    fireEvent.blur(submitterInput);
    fireEvent.blur(studyInput);

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalled();
    });

    const expectedForm: FilterForm = {
      programName: defaultValues.programName,
      studyName: "",
      statuses: DEFAULT_STATUSES_SELECTED,
      submitterName: "",
    };
    expect(onChangeMock).toHaveBeenCalledWith(expectedForm);
  });

  it("reset button resets filters to default values and calls onChange callback", async () => {
    jest.useFakeTimers();

    const onChangeMock = jest.fn();
    const { getByTestId } = render(
      <ListFilters applicationData={mockApplicationData} onChange={onChangeMock} />
    );

    const submitterInput = getByTestId("submitter-name-input") as HTMLInputElement;
    const studyInput = getByTestId("study-name-input") as HTMLInputElement;

    userEvent.type(submitterInput, "Some Name");
    userEvent.type(studyInput, "Some Study");

    jest.advanceTimersByTime(500);

    const resetButton = getByTestId("reset-filters-button");
    userEvent.click(resetButton);

    // Causes error without the act
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalledWith(defaultValues);
      expect(submitterInput.value).toBe("");
      expect(studyInput.value).toBe("");
    });
  });

  it("renders program options correctly in the Autocomplete field", async () => {
    const { getByPlaceholderText, findAllByRole } = render(
      <ListFilters applicationData={mockApplicationData} />
    );

    const programInput = getByPlaceholderText(/Select programs/i);
    expect(programInput).toBeInTheDocument();

    userEvent.click(programInput);

    const options = await findAllByRole("option");
    const optionTexts = options.map((opt) => opt.textContent);
    expect(optionTexts).toEqual(expect.arrayContaining(["All", "Program A", "Program B"]));
  });

  it("renders status select options correctly", async () => {
    const { getByTestId } = render(<ListFilters applicationData={mockApplicationData} />);

    const statusSelect = within(getByTestId("application-status-filter")).getByRole("button");
    expect(statusSelect).toBeInTheDocument();

    userEvent.click(statusSelect);

    const statusOptions = within(getByTestId("application-status-filter")).getByRole("listbox", {
      hidden: true,
    });

    expect(within(statusOptions).getByTestId("application-status-New")).toBeInTheDocument();
    expect(within(statusOptions).getByTestId("application-status-Submitted")).toBeInTheDocument();
  });

  it("works correctly even when no onChange prop is provided", () => {
    const { getByTestId } = render(<ListFilters applicationData={mockApplicationData} />);
    const resetButton = getByTestId("reset-filters-button");
    expect(resetButton).toBeInTheDocument();
    expect(() => userEvent.click(resetButton)).not.toThrow();
  });
});
