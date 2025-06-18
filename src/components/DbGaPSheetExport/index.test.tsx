import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { useMemo } from "react";
import { axe } from "vitest-axe";
import userEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";
import {
  SubmissionContext,
  SubmissionCtxState,
  SubmissionCtxStatus,
} from "../Contexts/SubmissionContext";
import {
  DOWNLOAD_DB_GAP_SHEET,
  DownloadDbGaPSheetInput,
  DownloadDbGaPSheetResp,
  GetSubmissionResp,
} from "../../graphql";
import Button from "./index";
import { render, waitFor } from "../../test-utils";

// Omit properties that are explicitly needed for the tests
const baseSubmission: Omit<GetSubmissionResp["getSubmission"], "_id" | "dataCommons"> = {
  name: "",
  submitterID: "",
  submitterName: "",
  organization: null,
  dataCommonsDisplayName: "",
  modelVersion: "",
  studyID: "",
  studyAbbreviation: "",
  studyName: "",
  dbGaPID: "",
  bucketName: "",
  rootPath: "",
  status: "New",
  metadataValidationStatus: "New",
  fileValidationStatus: "New",
  crossSubmissionStatus: "New",
  deletingData: false,
  archived: false,
  validationStarted: "",
  validationEnded: "",
  validationScope: "New",
  validationType: [],
  fileErrors: [],
  history: [],
  conciergeName: "",
  conciergeEmail: "",
  intention: "New/Update",
  dataType: "Metadata Only",
  otherSubmissions: "",
  nodeCount: 0,
  collaborators: [],
  dataFileSize: {
    formatted: "",
    size: 0,
  },
  createdAt: "",
  updatedAt: "",
};

type MockParentProps = {
  /**
   * Partial submission data, with at least _id and dataCommons properties.
   */
  submission: Partial<GetSubmissionResp["getSubmission"]> &
    Pick<GetSubmissionResp["getSubmission"], "_id" | "dataCommons">;
  mocks: MockedResponse[];
  children: React.ReactNode;
};

const MockParent: React.FC<MockParentProps> = ({ submission, mocks, children }) => {
  const ctxState = useMemo<SubmissionCtxState>(
    () => ({
      data: {
        getSubmission: {
          ...baseSubmission,
          ...submission,
        },
        batchStatusList: null,
        submissionStats: null,
      },
      status: SubmissionCtxStatus.LOADED,
      error: null,
    }),
    [submission]
  );

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <SubmissionContext.Provider value={ctxState}>{children}</SubmissionContext.Provider>
    </MockedProvider>
  );
};

describe("Accessibility", () => {
  it("should have no accessibility violations", async () => {
    const { container, getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <MockParent submission={{ _id: "mock-accessibility", dataCommons: "CDS" }} mocks={[]}>
          {children}
        </MockParent>
      ),
    });

    expect(getByTestId("dbgap-sheet-export-button")).toBeInTheDocument(); // Sanity check

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no accessibility violations when disabled", async () => {
    const { container, getByTestId } = render(<Button disabled />, {
      wrapper: ({ children }) => (
        <MockParent submission={{ _id: "mock-accessibility", dataCommons: "CDS" }} mocks={[]}>
          {children}
        </MockParent>
      ),
    });

    expect(getByTestId("dbgap-sheet-export-button")).toBeDisabled(); // Sanity check

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    const { container } = render(<Button />, {
      wrapper: ({ children }) => (
        <MockParent submission={{ _id: null, dataCommons: null }} mocks={[]}>
          {children}
        </MockParent>
      ),
    });

    expect(container).toBeInTheDocument();
  });

  it("should forward supported attributes to the button", () => {
    const { getByTestId } = render(<Button aria-details="mock-details" name="mock-name" />, {
      wrapper: ({ children }) => (
        <MockParent submission={{ _id: "mock-attributes-check", dataCommons: "CDS" }} mocks={[]}>
          {children}
        </MockParent>
      ),
    });

    const button = getByTestId("dbgap-sheet-export-button");
    expect(button).toHaveAttribute("aria-details", "mock-details");
    expect(button).toHaveAttribute("name", "mock-name");
  });

  it("should handle API errors gracefully (GraphQL)", async () => {
    const mock: MockedResponse<DownloadDbGaPSheetResp, DownloadDbGaPSheetInput> = {
      request: {
        query: DOWNLOAD_DB_GAP_SHEET,
      },
      variableMatcher: () => true,
      result: {
        errors: [new GraphQLError("mock error")],
      },
    };

    const { getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <MockParent submission={{ _id: "mock-graph-error", dataCommons: "CDS" }} mocks={[mock]}>
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("dbgap-sheet-export-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Oops! Unable to download the dbGaP Loading Sheets.",
        { variant: "error" }
      );
    });
  });

  it("should handle API errors gracefully (Network)", async () => {
    const mock: MockedResponse<DownloadDbGaPSheetResp, DownloadDbGaPSheetInput> = {
      request: {
        query: DOWNLOAD_DB_GAP_SHEET,
      },
      variableMatcher: () => true,
      error: new Error("Network error"),
    };

    const { getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <MockParent submission={{ _id: "mock-network-error", dataCommons: "CDS" }} mocks={[mock]}>
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("dbgap-sheet-export-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Oops! Unable to download the dbGaP Loading Sheets.",
        { variant: "error" }
      );
    });
  });

  it("should handle API errors gracefully (API Misc)", async () => {
    const mock: MockedResponse<DownloadDbGaPSheetResp, DownloadDbGaPSheetInput> = {
      request: {
        query: DOWNLOAD_DB_GAP_SHEET,
      },
      variableMatcher: () => true,
      result: {
        data: {
          downloadDBGaPLoadSheet: null,
        },
      },
    };

    const { getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <MockParent submission={{ _id: "mock-api-error", dataCommons: "CDS" }} mocks={[mock]}>
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("dbgap-sheet-export-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Oops! Unable to download the dbGaP Loading Sheets.",
        { variant: "error" }
      );
    });
  });

  it("should be disabled while the API request is in process", async () => {
    vi.useFakeTimers();

    const mock: MockedResponse<DownloadDbGaPSheetResp, DownloadDbGaPSheetInput> = {
      request: {
        query: DOWNLOAD_DB_GAP_SHEET,
      },
      variableMatcher: () => true,
      result: {
        data: {
          downloadDBGaPLoadSheet: "https://example.com/mock-sheet-url", // This will never be reached in this test
        },
      },
      delay: 1000, // Simulate a delay to keep the button disabled
    };

    const { getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <MockParent submission={{ _id: "mock-disabled-state", dataCommons: "CDS" }} mocks={[mock]}>
          {children}
        </MockParent>
      ),
    });

    expect(getByTestId("dbgap-sheet-export-button")).toBeEnabled(); // Sanity check

    userEvent.click(getByTestId("dbgap-sheet-export-button"), null, { skipHover: true });

    await waitFor(() => {
      expect(getByTestId("dbgap-sheet-export-button")).toBeDisabled();
    });

    vi.useRealTimers();
  });
});

describe("Implementation Requirements", () => {
  it("should render with the text 'dbGaP Sheets'", () => {
    const { getByText } = render(<Button />, {
      wrapper: ({ children }) => (
        <MockParent submission={{ _id: "mock-text-check", dataCommons: "CDS" }} mocks={[]}>
          {children}
        </MockParent>
      ),
    });

    expect(getByText("dbGaP Sheets")).toBeInTheDocument();
  });

  it("should have a tooltip on hover", async () => {
    const { getByTestId, findByRole } = render(<Button />, {
      wrapper: ({ children }) => (
        <MockParent submission={{ _id: "mock-tooltip-check", dataCommons: "CDS" }} mocks={[]}>
          {children}
        </MockParent>
      ),
    });

    const button = getByTestId("dbgap-sheet-export-button");
    userEvent.hover(button);

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toHaveTextContent(
      `This download generates dbGaP submission sheets based on available submission data. Additional information may still be required to complete the dbGaP submission.`
    );

    userEvent.unhover(button);

    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  });

  it.each<string>(["CDS"])(
    "should only be enabled for the supported data commons (%s)",
    (dataCommons) => {
      const { getByTestId } = render(<Button />, {
        wrapper: ({ children }) => (
          <MockParent submission={{ _id: "mock-data-commons-check", dataCommons }} mocks={[]}>
            {children}
          </MockParent>
        ),
      });

      expect(getByTestId("dbgap-sheet-export-button")).toBeVisible();
      expect(getByTestId("dbgap-sheet-export-button")).toBeEnabled();
    }
  );

  it.each<string>(["ICDC", "CTDC", "CCDI", "mock-dc"])(
    "should not be rendered for unsupported data commons (%s)",
    (dataCommons) => {
      const { queryByTestId } = render(<Button />, {
        wrapper: ({ children }) => (
          <MockParent submission={{ _id: "mock-unsupported-dc-check", dataCommons }} mocks={[]}>
            {children}
          </MockParent>
        ),
      });

      expect(queryByTestId("dbgap-sheet-export-button")).not.toBeInTheDocument();
    }
  );

  it("should open the download link in a new tab", async () => {
    vi.spyOn(global, "open").mockImplementation(() => null);

    const mock: MockedResponse<DownloadDbGaPSheetResp, DownloadDbGaPSheetInput> = {
      request: {
        query: DOWNLOAD_DB_GAP_SHEET,
      },
      variableMatcher: () => true,
      result: {
        data: {
          downloadDBGaPLoadSheet: "https://example.com/mock-sheet-url",
        },
      },
    };

    const { getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <MockParent submission={{ _id: "mock-tooltip-check", dataCommons: "CDS" }} mocks={[mock]}>
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("dbgap-sheet-export-button"));

    await waitFor(() => {
      expect(global.open).toHaveBeenCalledWith(
        "https://example.com/mock-sheet-url",
        "_blank",
        "noopener"
      );
    });
  });
});
