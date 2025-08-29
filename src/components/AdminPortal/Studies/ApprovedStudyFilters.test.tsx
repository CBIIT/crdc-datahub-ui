import React, { FC } from "react";
import { fireEvent, render, waitFor, within } from "@testing-library/react";
import { MemoryRouter, MemoryRouterProps } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import ApprovedStudyFilters from "./ApprovedStudyFilters";
import { SearchParamsProvider, useSearchParamsContext } from "../../Contexts/SearchParamsContext";
import { OrganizationProvider } from "../../Contexts/OrganizationListContext";
import { LIST_ORGS, ListOrgsInput, ListOrgsResp } from "../../../graphql";

const listOrgMocks: MockedResponse<ListOrgsResp, ListOrgsInput>[] = [
  {
    request: {
      query: LIST_ORGS,
    },
    variableMatcher: () => true,
    result: {
      data: {
        listPrograms: {
          total: 1,
          programs: [
            {
              _id: "option-1",
              name: "Option 1",
              abbreviation: "O1",
              conciergeName: "primary-contact-1",
              createdAt: "",
              description: "",
              status: "Active",
              studies: [],
              readOnly: false,
              updateAt: "",
            },
          ],
        },
      },
    },
    maxUsageCount: Infinity,
  },
];

type ParentProps = {
  mocks?: MockedResponse[];
  initialEntries?: MemoryRouterProps["initialEntries"];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({
  mocks = [],
  initialEntries = ["/"],
  children,
}: ParentProps) => (
  <MockedProvider mocks={[...listOrgMocks, ...mocks]}>
    <MemoryRouter initialEntries={initialEntries}>
      <OrganizationProvider preload>
        <SearchParamsProvider>{children}</SearchParamsProvider>
      </OrganizationProvider>
    </MemoryRouter>
  </MockedProvider>
);

describe("ApprovedStudyFilters Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("renders without crashing", async () => {
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
    });
  });

  it("has no accessibility violations", async () => {
    const { getByTestId, container } = render(
      <TestParent>
        <ApprovedStudyFilters />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders all input fields correctly", async () => {
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
    });

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

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
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
    const mockOnChange = jest.fn();

    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
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

    const mockOnChange = jest.fn();

    const { getByTestId } = render(
      <TestParent initialEntries={["/?accessType=Controlled"]}>
        <ApprovedStudyFilters onChange={mockOnChange} />
        <ShowSearchParams />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
    });

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
    expect(getByTestId("search-params")).not.toContain("accessType=");
  });

  it("allows users to type into the study input", async () => {
    const { getByTestId } = render(
      <TestParent>
        <ApprovedStudyFilters />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
    });

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
    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
    });

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

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
    });

    expect(mockOnChange).toHaveBeenCalledWith({
      study: "",
      dbGaPID: "",
      accessType: "All",
      programID: "All",
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
        programID: "All",
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

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
    });

    const studyInput = getByTestId("study-input");
    const dbGaPIDInput = getByTestId("dbGaPID-input");

    fireEvent.change(studyInput, { target: { value: "" } });
    fireEvent.change(dbGaPIDInput, { target: { value: "" } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        study: "",
        dbGaPID: "",
        accessType: "All",
        programID: "All",
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

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
    });

    const studyInput = getByTestId("study-input");

    userEvent.clear(studyInput);
    userEvent.type(studyInput, "Test Study");

    // Advance timers to trigger debounce
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledTimes(2);
      expect(mockOnChange).toHaveBeenCalledWith({
        study: "Test Study",
        dbGaPID: "",
        accessType: "All",
        programID: "All",
      });
    });

    // Ensure no additional calls are made
    jest.advanceTimersByTime(500);
    expect(mockOnChange).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it("updates dbGaPID input when searchParams dbGaPID is different", async () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <TestParent initialEntries={["/test?dbGaPID=DB123"]}>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
    });

    const dbGaPIDInput = getByTestId("dbGaPID-input");

    await waitFor(() => {
      expect(dbGaPIDInput).toHaveValue("DB123");
    });

    expect(mockOnChange).toHaveBeenCalledWith({
      study: "",
      dbGaPID: "DB123",
      accessType: "All",
      programID: "All",
    });
  });

  it("updates accessType dropdown when searchParams accessType is different", async () => {
    const mockOnChange = jest.fn();

    const { getByTestId } = render(
      <TestParent initialEntries={["/test?accessType=Controlled"]}>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
    });

    const accessTypeSelect = getByTestId("accessType-select");

    await waitFor(() => {
      expect(accessTypeSelect).toHaveTextContent("Controlled");
    });

    expect(mockOnChange).toHaveBeenCalledWith({
      study: "",
      dbGaPID: "",
      accessType: "Controlled",
      programID: "All",
    });
  });

  it("handles accessTypeFilter being 'All' correctly when study equals studyFilter", async () => {
    const mockOnChange = jest.fn();

    const { getByTestId } = render(
      <TestParent initialEntries={["/?study=Study1&accessType=All"]}>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
    });

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
      programID: "All",
    });
  });

  it("handles invalid accessTypeFilter value in searchParams correctly", async () => {
    const mockOnChange = jest.fn();

    const { getByTestId } = render(
      <TestParent initialEntries={["/?study=Study1&accessType=invalid-access-type"]}>
        <ApprovedStudyFilters onChange={mockOnChange} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("approved-study-filters")).toBeInTheDocument();
    });

    const accessTypeSelect = getByTestId("accessType-select");

    expect(accessTypeSelect).toHaveTextContent("All");
    expect(mockOnChange).toHaveBeenCalledWith({
      study: "Study1",
      dbGaPID: "",
      accessType: "All",
      programID: "All",
    });
  });
});
